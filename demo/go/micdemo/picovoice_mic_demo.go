// Copyright 2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is
// located in the "LICENSE" file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the
// License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing permissions and
// limitations under the License.

package main

import (
	"encoding/binary"
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"

	. "github.com/Picovoice/picovoice/sdk/go"
	rhn "github.com/Picovoice/rhino/binding/go"
	"github.com/gen2brain/malgo"
	"github.com/go-audio/wav"
)

func main() {
	keywordPathArg := flag.String("keyword_path", "", "Path to Porcupine keyword file (.ppn)")
	contextPathArg := flag.String("context_path", "", "Path to Rhino context file (.rhn)")
	porcupineModelPathArg := flag.String("porcupine_model_path", "", "(optional) Path to Porcupine's model file (.pv)")
	porcupineSensitivityArg := flag.String("porcupine_sensitivity", "", "(optional) Sensitivity for detecting wake word. "+
		"Each value should be a number within [0, 1]. A higher "+
		"sensitivity results in fewer misses at the cost of increasing the false alarm rate. "+
		"If not set, 0.5 will be used.")
	rhinoModelPathArg := flag.String("rhino_model_path", "", "(optional) Path to Rhino's model file (.pv)")
	rhinoSensitivityArg := flag.String("rhino_sensitivity", "", "(optional) Inference sensitivity. "+
		"The value should be a number within [0, 1]. A higher sensitivity value results in "+
		"fewer misses at the cost of (potentially) increasing the erroneous inference rate. "+
		"If not set, 0.5 will be used.")
	audioDeviceIndex := flag.Int("audio_device_index", -1, "(optional) Index of capture device to use.")
	outputPathArg := flag.String("output_path", "", "(optional) Path to recorded audio (for debugging)")
	showAudioDevices := flag.Bool("show_audio_devices", false, "(optional) Display all available capture devices")
	flag.Parse()

	if *showAudioDevices {
		printAudioDevices()
		return
	}

	var outputWav *wav.Encoder
	if *outputPathArg != "" {
		outputFilePath, _ := filepath.Abs(*outputPathArg)
		outputFile, err := os.Create(outputFilePath)
		if err != nil {
			log.Fatalf("Failed to create output audio at path %s", outputFilePath)
		}
		defer outputFile.Close()

		outputWav = wav.NewEncoder(outputFile, SampleRate, 16, 1, 1)
		defer outputWav.Close()
	}

	p := Picovoice{}

	// validate keyword
	if *keywordPathArg != "" {
		keywordPath, _ := filepath.Abs(*keywordPathArg)
		if _, err := os.Stat(keywordPath); os.IsNotExist(err) {
			log.Fatalf("Could not find keyword file at %s", keywordPath)
		}

		p.KeywordPath = keywordPath
	}

	// context path
	if *contextPathArg != "" {
		contextPath, _ := filepath.Abs(*contextPathArg)
		if _, err := os.Stat(contextPath); os.IsNotExist(err) {
			log.Fatalf("Could not find context file at %s", contextPath)
		}

		p.ContextPath = contextPath
	}

	// validate Porcupine model
	if *porcupineModelPathArg != "" {
		porcupineModelPath, _ := filepath.Abs(*porcupineModelPathArg)
		if _, err := os.Stat(porcupineModelPath); os.IsNotExist(err) {
			log.Fatalf("Could not find Porcupine model file at %s", porcupineModelPath)
		}

		p.PorcupineModelPath = porcupineModelPath
	}

	// validate Rhino model
	if *rhinoModelPathArg != "" {
		rhinoModelPath, _ := filepath.Abs(*rhinoModelPathArg)
		if _, err := os.Stat(rhinoModelPath); os.IsNotExist(err) {
			log.Fatalf("Could not find Rhino model file at %s", rhinoModelPath)
		}

		p.RhinoModelPath = rhinoModelPath
	}

	// validate Porcupine sensitivity
	if *porcupineSensitivityArg == "" {
		p.PorcupineSensitivity = 0.5

	} else {
		sensitivityFloat, err := strconv.ParseFloat(*porcupineSensitivityArg, 32)
		if err != nil || sensitivityFloat < 0 || sensitivityFloat > 1 {
			log.Fatalf("Porcupine sensitivity value of '%s' is invalid. Must be a float32 between [0, 1].", *porcupineSensitivityArg)
		}
		p.PorcupineSensitivity = float32(sensitivityFloat)
	}

	// validate Rhino sensitivity
	if *rhinoSensitivityArg == "" {
		p.RhinoSensitivity = 0.5

	} else {
		sensitivityFloat, err := strconv.ParseFloat(*rhinoSensitivityArg, 32)
		if err != nil || sensitivityFloat < 0 || sensitivityFloat > 1 {
			log.Fatalf("Rhino sensitivity value of '%s' is invalid. Must be a float32 between [0, 1].", *rhinoSensitivityArg)
		}
		p.RhinoSensitivity = float32(sensitivityFloat)
	}

	p.WakeWordCallback = func() { fmt.Println("[wake word]") }
	p.InferenceCallback = func(inference rhn.RhinoInference) {
		if inference.IsUnderstood {
			fmt.Println("{")
			fmt.Printf("  intent : '%s'\n", inference.Intent)
			fmt.Println("  slots : {")
			for k, v := range inference.Slots {
				fmt.Printf("    %s : '%s'\n", k, v)
			}
			fmt.Println("  }")
			fmt.Println("}")
		} else {
			fmt.Println("Didn't understand the command")
		}
	}

	var backends []malgo.Backend = nil
	if runtime.GOOS == "windows" {
		backends = []malgo.Backend{malgo.BackendWinmm}
	} else if runtime.GOOS == "linux" {
		backends = []malgo.Backend{malgo.BackendAlsa}
	}

	context, err := malgo.InitContext(backends, malgo.ContextConfig{}, func(message string) {
		fmt.Printf("%v\n", message)
	})
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		_ = context.Uninit()
		context.Free()
	}()

	deviceConfig := malgo.DefaultDeviceConfig(malgo.Duplex)
	deviceConfig.Capture.Format = malgo.FormatS16
	deviceConfig.Capture.Channels = 1
	deviceConfig.SampleRate = 16000

	if *audioDeviceIndex >= 0 {
		infos, err := context.Devices(malgo.Capture)
		if err != nil {
			log.Fatal(err)
		}

		if *audioDeviceIndex > len(infos)-1 {
			fmt.Printf("Audio device at index %d does not exist. Using default capture device.\n", *audioDeviceIndex)
		} else {
			deviceConfig.Capture.DeviceID = infos[*audioDeviceIndex].ID.Pointer()
		}
	}

	err = p.Init()
	if err != nil {
		log.Fatal(err)
	}
	defer p.Delete()

	var shortBufIndex, shortBufOffset int
	shortBuf := make([]int16, FrameLength)

	onRecvFrames := func(pSample2, pSample []byte, framecount uint32) {
		for i := 0; i < len(pSample); i += 2 {
			shortBuf[shortBufIndex+shortBufOffset] = int16(binary.LittleEndian.Uint16(pSample[i : i+2]))
			shortBufOffset++

			if shortBufIndex+shortBufOffset == FrameLength {
				shortBufIndex = 0
				shortBufOffset = 0

				err := p.Process(shortBuf)
				if err != nil {
					log.Fatal(err)
				}

				// write to debug file
				if outputWav != nil {
					for outputBufIndex := range shortBuf {
						outputWav.WriteFrame(shortBuf[outputBufIndex])
					}
				}
			}
		}
		shortBufIndex += shortBufOffset
		shortBufOffset = 0
	}

	captureCallbacks := malgo.DeviceCallbacks{
		Data: onRecvFrames,
	}
	device, err := malgo.InitDevice(context.Context, deviceConfig, captureCallbacks)
	if err != nil {
		log.Fatal(err)
	}

	err = device.Start()
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Press Enter to stop recording.")
	fmt.Println("Listening...")
	fmt.Scanln()

	device.Uninit()
}

func printAudioDevices() {
	context, err := malgo.InitContext(nil, malgo.ContextConfig{}, nil)
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		_ = context.Uninit()
		context.Free()
	}()

	// Capture devices.
	infos, err := context.Devices(malgo.Capture)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Println("Capture Devices")
	for i, info := range infos {
		fmt.Printf("    %d: %s\n", i, strings.Replace(info.Name(), "\x00", "", -1))
	}
}
