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
	"flag"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path/filepath"
	"strconv"

	. "github.com/Picovoice/picovoice/sdk/go"
	pvrecorder "github.com/Picovoice/pvrecorder/sdk/go"
	rhn "github.com/Picovoice/rhino/binding/go"

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

	err := p.Init()
	if err != nil {
		log.Fatal(err)
	}
	defer p.Delete()

	recorder := pvrecorder.PvRecorder{
        DeviceIndex: *audioDeviceIndex,
        FrameLength: FrameLength,
        BufferSizeMSec: 1000,
        LogOverflow: 0,
    }

    if err := recorder.Init(); err != nil {
        log.Fatalf("Error: %s.\n", err.Error())
    }
    defer recorder.Delete()

    if err := recorder.Start(); err != nil {
        log.Fatalf("Error: %s.\n", err.Error())
    }

    signalCh := make(chan os.Signal, 1)
    waitCh := make(chan struct{})
    signal.Notify(signalCh, os.Interrupt)

    go func () {
        <- signalCh
        close(waitCh)
    }()

    log.Printf("Using device: %s", recorder.GetSelectedDevice())
	fmt.Println("Listening...")
    
    waitLoop:
    for {
        select {
        case <- waitCh:
            log.Println("Stopping...")
            break waitLoop
        default:
            pcm, err := recorder.Read()
            if err != nil {
                log.Fatalf("Error: %s.\n", err.Error())
            }
            err = p.Process(pcm)
            if err != nil {
                log.Fatal(err)
            }
            // write to debug file
            if outputWav != nil {
                for outputBufIndex := range pcm {
                    outputWav.WriteFrame(pcm[outputBufIndex])
                }
            }
        }
    }
}

func printAudioDevices() {
	if devices, err := pvrecorder.GetAudioDevices(); err != nil {
        log.Fatalf("Error: %s.\n", err.Error())
    } else {
        for i, device := range devices {
            log.Printf("index: %d, device name: %s\n", i, device)
        }
    }
}
