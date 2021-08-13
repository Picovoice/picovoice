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

	rhn "github.com/Picovoice/rhino/binding/go"
)

var (
	osName             = getOS()
	p                  Picovoice
	isWakeWordDetected = false
	inference          rhn.RhinoInference
)

func TestMain(m *testing.M) {

	keywordPath, _ := filepath.Abs(fmt.Sprintf("../../resources/porcupine/resources/keyword_files/%s/picovoice_%s.ppn", osName, osName))
	contextPath, _ := filepath.Abs(fmt.Sprintf("../../resources/rhino/resources/contexts/%s/coffee_maker_%s.rhn", osName, osName))
	wakeWordCallback := func() { isWakeWordDetected = true }
	inferenceCallback := func(inferenceResult rhn.RhinoInference) { inference = inferenceResult }
	p = NewPicovoice(keywordPath, wakeWordCallback, contextPath, inferenceCallback)
	err := p.Init()
	if err != nil {
		log.Fatalf("%v", err)
	}
	defer p.Delete()

	fmt.Printf("Version: %s\n", Version)
	fmt.Printf("Frame Length: %d\n", FrameLength)
	fmt.Printf("Samples Rate: %d\n", SampleRate)
	fmt.Printf("Context Info: %s\n", p.ContextInfo)

	os.Exit(m.Run())
}

func TestProcess(t *testing.T) {

	testFile, _ := filepath.Abs("../../resources/audio_samples/picovoice-coffee.wav")

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

		err = p.Process(sampleBuffer)
		if err != nil {
			t.Fatalf("Picovoice process fail: %v", err)
		}
	}

	if !isWakeWordDetected {
		t.Fatalf("Did not detect wake word 'picovoice'.")
	}

	if !inference.IsUnderstood {
		t.Fatalf("Didn't understand.")
	}

	expectedIntent := "orderBeverage"
	if inference.Intent != expectedIntent {
		t.Fatalf("Incorrect intent '%s' (expected %s)", inference.Intent, expectedIntent)
	}

	expectedSlotValues := map[string]string{"beverage": "coffee", "size": "large"}
	if !reflect.DeepEqual(inference.Slots, expectedSlotValues) {
		t.Fatalf("Incorrect slots '%v'\n Expected %v", inference.Slots, expectedSlotValues)
	}
}

func TestProcessAgain(t *testing.T) {
	TestProcess(t)
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
			cpuPart = strings.ToLower(split[len(split) - 1])
			break
		}
	}

	switch cpuPart {
	case "0xb76":
		return "raspberry-pi"
	case "0xc07":
		return "raspberry-pi"
	case "0xd03":
		return "raspberry-pi"
	case "0xd07":
		return "jetson"
	case "0xd08":
		return "raspberry-pi"
	case "0xc08":
		return "beaglebone"
	default:
		log.Printf(`WARNING: Please be advised that this device (CPU part = %s) is not officially supported by Picovoice.\n`, cpuPart)
		return "linux"
	}
}
