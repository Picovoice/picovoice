// Copyright 2021 Picovoice Inc.
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
)

func TestMain(m *testing.M) {

	flag.StringVar(&pvTestAccessKey, "access_key", "", "AccessKey for testing")
	flag.Parse()

	os.Exit(m.Run())
}

func Test(t *testing.T) {

	language := "en"
	keyword := "picovoice"
	context := "coffee_maker"
	wakeWordCallback := func() { isWakeWordDetected = true }
	inferenceCallback := func(inferenceResult rhn.RhinoInference) { inference = inferenceResult }
	picovoice = NewPicovoice(
		pvTestAccessKey,
		getTestKeywordPath(language, keyword),
		wakeWordCallback,
		getTestContextPath(language, context),
		inferenceCallback)
	initTestPicovoice(t)
	
	t.Logf("Version: %s\n", Version)
	t.Logf("Frame Length: %d\n", FrameLength)
	t.Logf("Samples Rate: %d\n", SampleRate)

	audioFileName := "picovoice-coffee.wav"
	expectedIntent := "orderBeverage"
	expectedSlots :=map[string]string{"beverage": "coffee", "size": "large"}
	runTestCase(
		t,
		audioFileName,
		expectedIntent,
		expectedSlots)

	deleteTestPicovoice(t)
}

func TestTwice(t *testing.T) {

	language := "en"
	keyword := "picovoice"
	context := "coffee_maker"
	wakeWordCallback := func() { isWakeWordDetected = true }
	inferenceCallback := func(inferenceResult rhn.RhinoInference) { inference = inferenceResult }
	picovoice = NewPicovoice(
		pvTestAccessKey,
		getTestKeywordPath(language, keyword),
		wakeWordCallback,
		getTestContextPath(language, context),
		inferenceCallback)
	initTestPicovoice(t)

	audioFileName := "picovoice-coffee.wav"
	expectedIntent := "orderBeverage"
	expectedSlots :=map[string]string{"beverage": "coffee", "size": "large"}
	runTestCase(
		t,
		audioFileName,
		expectedIntent,
		expectedSlots)
	runTestCase(
		t,
		audioFileName,
		expectedIntent,
		expectedSlots)	

	deleteTestPicovoice(t)
}

func TestTwiceDe(t *testing.T) {

	language := "de"
	keyword := "heuschrecke"
	context := "beleuchtung"
	wakeWordCallback := func() { isWakeWordDetected = true }
	inferenceCallback := func(inferenceResult rhn.RhinoInference) { inference = inferenceResult }
	picovoice = Picovoice{
		AccessKey: pvTestAccessKey,
		KeywordPath: getTestKeywordPath(language, keyword),
		ContextPath: getTestContextPath(language, context),
		PorcupineModelPath: getTestPorcupineModelPath(language),
		RhinoModelPath: getTestRhinoModelPath(language),
		WakeWordCallback: wakeWordCallback,
		InferenceCallback: inferenceCallback,
		PorcupineSensitivity: 0.5,
		RhinoSensitivity: 0.5,
		RequireEndpoint: true}
	initTestPicovoice(t)

	audioFileName := "heuschrecke-beleuchtung_de.wav"
	expectedIntent := "changeState"
	expectedSlots :=map[string]string{"state": "aus"}
	runTestCase(
		t,
		audioFileName,
		expectedIntent,
		expectedSlots)
	runTestCase(
		t,
		audioFileName,
		expectedIntent,
		expectedSlots)

	deleteTestPicovoice(t)
}

func TestTwiceEs(t *testing.T) {

	language := "es"
	keyword := "manzana"
	context := "luz"
	wakeWordCallback := func() { isWakeWordDetected = true }
	inferenceCallback := func(inferenceResult rhn.RhinoInference) { inference = inferenceResult }
	picovoice = Picovoice{
		AccessKey: pvTestAccessKey,
		KeywordPath: getTestKeywordPath(language, keyword),
		ContextPath: getTestContextPath(language, context),
		PorcupineModelPath: getTestPorcupineModelPath(language),
		RhinoModelPath: getTestRhinoModelPath(language),
		WakeWordCallback: wakeWordCallback,
		InferenceCallback: inferenceCallback,
		PorcupineSensitivity: 0.5,
		RhinoSensitivity: 0.5,
		RequireEndpoint: true}
	initTestPicovoice(t)

	audioFileName := "manzana-luz_es.wav"
	expectedIntent := "changeColor"
	expectedSlots :=map[string]string{"location": "habitación", "color": "rosado"}
	runTestCase(
		t,
		audioFileName,
		expectedIntent,
		expectedSlots)
	runTestCase(
		t,
		audioFileName,
		expectedIntent,
		expectedSlots)

	deleteTestPicovoice(t)
}

func initTestPicovoice(t* testing.T) {
	err := picovoice.Init()
	if err != nil {
		t.Fatalf("%v", err)
	}
}

func deleteTestPicovoice(t* testing.T) {
	err := picovoice.Delete()
	if err != nil {
		t.Fatalf("%v", err)
	}
}

func runTestCase(t* testing.T, audioFileName string, expectedIntent string, expectedSlots map[string]string) {
	t.Logf("Context Info: %s\n", picovoice.ContextInfo)

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
		return s;
	}
	return s + "_" + language
}

func getTestPorcupineModelPath(language string) string {
	modelRelPath := fmt.Sprintf(
		"../../resources/porcupine/lib/common/%s.pv",
		appendLanguage("porcupine_params", language));
	modelPath, _ := filepath.Abs(modelRelPath);
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
		osName);
	keywordPath, _ := filepath.Abs(keywordRelPath);
	return keywordPath
}

func getTestContextPath(language string, context string) string {
	contextRelPath := fmt.Sprintf(
		"../../resources/rhino/resources/%s/%s/%s_%s.rhn",
		appendLanguage("contexts", language),
		osName,
		context,
		osName)
	contextPath, _ :=  filepath.Abs(contextRelPath)
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
