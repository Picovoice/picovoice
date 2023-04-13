// Copyright 2021-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is
// located in the "LICENSE" file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the
// License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing permissions and
// limitations under the License.

package picovoice

import (
	"encoding/binary"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"runtime"
	"strings"
	"testing"

	rhn "github.com/Picovoice/rhino/binding/go/v2"
)

var (
	osName             = getOS()
	picovoice          Picovoice
	isWakeWordDetected = false
	inference          rhn.RhinoInference
	pvTestAccessKey    string
	testParameters     []TestData
)

type TestData struct {
	language       string
	keyword        string
	context        string
	testAudioFile  string
	expectedIntent string
	expectedSlots  map[string]string
}

func TestMain(m *testing.M) {

	flag.StringVar(&pvTestAccessKey, "access_key", "", "AccessKey for testing")
	flag.Parse()

	testParameters = loadTestData()
	os.Exit(m.Run())
}

func loadTestData() []TestData {
	content, err := ioutil.ReadFile("../../resources/.test/test_data.json")
	if err != nil {
		log.Fatalf("Could not read test data json: %v", err)
	}

	var testData struct {
		Tests struct {
			Parameters []struct {
				Language    string `json:"language"`
				Wakeword    string `json:"wakeword"`
				ContextName string `json:"context_name"`
				AudioFile   string `json:"audio_file"`
				Inference   struct {
					Intent string            `json:"intent"`
					Slots  map[string]string `json:"slots"`
				} `json:"inference"`
			} `json:"Parameters"`
		} `json:"tests"`
	}
	err = json.Unmarshal(content, &testData)
	if err != nil {
		log.Fatalf("Could not decode test data json: %v", err)
	}

	for _, x := range testData.Tests.Parameters {
		testData := TestData{
			language:       x.Language,
			keyword:        x.Wakeword,
			context:        x.ContextName,
			testAudioFile:  x.AudioFile,
			expectedIntent: x.Inference.Intent,
			expectedSlots:  x.Inference.Slots,
		}

		testParameters = append(testParameters, testData)
	}

	return testParameters
}

func TestProcess(t *testing.T) {

	wakeWordCallback := func() { isWakeWordDetected = true }
	inferenceCallback := func(inferenceResult rhn.RhinoInference) { inference = inferenceResult }

	for _, tt := range testParameters {
		t.Run(tt.language, func(t *testing.T) {
			picovoice = NewPicovoice(
				pvTestAccessKey,
				getTestKeywordPath(tt.language, tt.keyword),
				wakeWordCallback,
				getTestContextPath(tt.language, tt.context),
				inferenceCallback)
			picovoice.PorcupineModelPath = getTestPorcupineModelPath(tt.language)
			picovoice.RhinoModelPath = getTestRhinoModelPath(tt.language)
			initErr := picovoice.Init()
			if initErr != nil {
				t.Fatalf("%v", initErr)
			}

			runTestCase(
				t,
				tt.testAudioFile,
				tt.expectedIntent,
				tt.expectedSlots)

			isWakeWordDetected = false
			inference = rhn.RhinoInference{}

			// run again
			runTestCase(
				t,
				tt.testAudioFile,
				tt.expectedIntent,
				tt.expectedSlots)

			delErr := picovoice.Delete()
			if delErr != nil {
				t.Fatalf("%v", delErr)
			}
		})
	}

}

func runTestCase(t *testing.T, audioFileName string, expectedIntent string, expectedSlots map[string]string) {
	testFile, _ := filepath.Abs(filepath.Join("../../resources/audio_samples", audioFileName))
	data, err := ioutil.ReadFile(testFile)
	if err != nil {
		t.Fatalf("Could not read test file: %v", err)
	}
	data = data[44:] // skip header

	frameLenBytes := FrameLength * 2
	frameCount := int(math.Floor(float64(len(data)) / float64(frameLenBytes)))
	sampleBuffer := make([]int16, FrameLength)
	for i := 0; i < frameCount; i++ {
		start := i * frameLenBytes

		for j := 0; j < FrameLength; j++ {
			dataOffset := start + (j * 2)
			sampleBuffer[j] = int16(binary.LittleEndian.Uint16(data[dataOffset : dataOffset+2]))
		}

		err = picovoice.Process(sampleBuffer)
		if err != nil {
			t.Fatalf("Picovoice process fail: %v", err)
		}
	}

	if !isWakeWordDetected {
		t.Fatalf("Did not detect wake word.")
	}

	if !inference.IsUnderstood {
		t.Fatalf("Didn't understand.")
	}

	if inference.Intent != expectedIntent {
		t.Fatalf("Incorrect intent '%s' (expected %s)", inference.Intent, expectedIntent)
	}

	if !reflect.DeepEqual(inference.Slots, expectedSlots) {
		t.Fatalf("Incorrect slots '%v'\n Expected %v", inference.Slots, expectedSlots)
	}
}

func appendLanguage(s string, language string) string {
	if language == "en" {
		return s
	}
	return s + "_" + language
}

func getTestPorcupineModelPath(language string) string {
	modelRelPath := fmt.Sprintf(
		"../../resources/porcupine/lib/common/%s.pv",
		appendLanguage("porcupine_params", language))
	modelPath, _ := filepath.Abs(modelRelPath)
	return modelPath
}

func getTestRhinoModelPath(language string) string {
	modelRelPath := fmt.Sprintf(
		"../../resources/rhino/lib/common/%s.pv",
		appendLanguage("rhino_params", language))
	modelPath, _ := filepath.Abs(modelRelPath)
	return modelPath
}

func getTestKeywordPath(language string, keyword string) string {
	keywordRelPath := fmt.Sprintf(
		"../../resources/porcupine/resources/%s/%s/%s_%s.ppn",
		appendLanguage("keyword_files", language),
		osName,
		keyword,
		osName)
	keywordPath, _ := filepath.Abs(keywordRelPath)
	return keywordPath
}

func getTestContextPath(language string, context string) string {
	contextRelPath := fmt.Sprintf(
		"../../resources/rhino/resources/%s/%s/%s_%s.rhn",
		appendLanguage("contexts", language),
		osName,
		context,
		osName)
	contextPath, _ := filepath.Abs(contextRelPath)
	return contextPath
}

func getOS() string {
	switch os := runtime.GOOS; os {
	case "darwin":
		return "mac"
	case "linux":
		return getLinuxDetails()
	case "windows":
		return "windows"
	default:
		log.Fatalf("%s is not a supported OS", os)
		return ""
	}
}

func getLinuxDetails() string {
	if runtime.GOARCH == "amd64" {
		return "linux"
	}

	cmd := exec.Command("cat", "/proc/cpuinfo")
	cpuInfo, err := cmd.Output()

	if err != nil {
		log.Fatalf("Failed to get CPU details: %s", err.Error())
	}

	var cpuPart = ""
	for _, line := range strings.Split(string(cpuInfo), "\n") {
		if strings.Contains(line, "CPU part") {
			split := strings.Split(line, " ")
			cpuPart = strings.ToLower(split[len(split)-1])
			break
		}
	}

	switch cpuPart {
	case "0xb76", "0xc07", "0xd03", "0xd08":
		return "raspberry-pi"
	case "0xd07":
		return "jetson"
	case "0xc08":
		return "beaglebone"
	default:
		log.Fatalf(`This device (CPU part = %s) is not supported by Picovoice.`, cpuPart)
	}
	return ""
}
