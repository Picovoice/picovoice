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

	. "github.com/Picovoice/picovoice/sdk/go/v2"
	pvrecorder "github.com/Picovoice/pvrecorder/sdk/go"
	rhn "github.com/Picovoice/rhino/binding/go/v2"

	"github.com/go-audio/wav"
)

func main() {
	accessKeyArg := flag.String("access_key", "", "AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)")
	keywordPathArg := flag.String("keyword_path", "", "Path to Porcupine keyword file (.ppn)")
	contextPathArg := flag.String("context_path", "", "Path to Rhino context file (.rhn)")
	porcupineLibraryPathArg := flag.String("porcupine_library_path", "", "Path to Porcupine dynamic library file (.so/.dylib/.dll)")
	porcupineModelPathArg := flag.String("porcupine_model_path", "", "(optional) Path to Porcupine's model file (.pv)")
	porcupineSensitivityArg := flag.Float64("porcupine_sensitivity", 0.5, "(optional) Sensitivity for detecting wake word. "+
		"Each value should be a number within [0, 1]. A higher "+
		"sensitivity results in fewer misses at the cost of increasing the false alarm rate. "+
		"If not set, 0.5 will be used.")
	rhinoLibraryPathArg := flag.String("rhino_library_path", "", "Path to Rhino dynamic library file (.so/.dylib/.dll)")
	rhinoModelPathArg := flag.String("rhino_model_path", "", "(optional) Path to Rhino's model file (.pv)")
	rhinoSensitivityArg := flag.Float64("rhino_sensitivity", 0.5, "(optional) Inference sensitivity. "+
		"The value should be a number within [0, 1]. A higher sensitivity value results in "+
		"fewer misses at the cost of (potentially) increasing the erroneous inference rate. "+
		"If not set, 0.5 will be used.")
	endpointDurationArg := flag.Float64("endpoint_duration", 1.0, "Endpoint duration in seconds. "+
		"An endpoint is a chunk of silence at the end of an utterance that marks the end of spoken command. "+
		"It should be a positive number within [0.5, 5]. If not set, 1.0 will be used.")
	requireEndpointArg := flag.String("require_endpoint", "true",
		"If set, Rhino requires an endpoint (chunk of silence) before finishing inference.")
	audioDeviceIndex := flag.Int("audio_device_index", -1, "(optional) Index of capture device to use.")
	outputPathArg := flag.String("output_path", "", "(optional) Path to recorded audio (for debugging)")
	showAudioDevices := flag.Bool("show_audio_devices", false, "(optional) Display all available capture devices")
	flag.Parse()

	if *showAudioDevices {
		printAudioDevices()
		return
	}

	p := Picovoice{
		RequireEndpoint: true,
	}
	if *requireEndpointArg == "false" {
		p.RequireEndpoint = false
	}

	if *accessKeyArg == "" {
		log.Fatalf("AccessKey is required.")
	}
	p.AccessKey = *accessKeyArg

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

	// validate Porcupine library
	if *porcupineLibraryPathArg != "" {
		porcupineLibraryPath, _ := filepath.Abs(*porcupineLibraryPathArg)
		if _, err := os.Stat(porcupineLibraryPath); os.IsNotExist(err) {
			log.Fatalf("Could not find Porcupine library file at %s", porcupineLibraryPath)
		}

		p.PorcupineLibraryPath = porcupineLibraryPath
	}

	// validate Rhino library
	if *rhinoLibraryPathArg != "" {
		rhinoLibraryPath, _ := filepath.Abs(*rhinoLibraryPathArg)
		if _, err := os.Stat(rhinoLibraryPath); os.IsNotExist(err) {
			log.Fatalf("Could not find Rhino library file at %s", rhinoLibraryPath)
		}

		p.RhinoLibraryPath = rhinoLibraryPath
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
	ppnSensitivityFloat := float32(*porcupineSensitivityArg)
	if ppnSensitivityFloat < 0 || ppnSensitivityFloat > 1 {
		log.Fatalf("Sensitivity value of '%f' is invalid. Must be between [0, 1].", ppnSensitivityFloat)
	}
	p.PorcupineSensitivity = ppnSensitivityFloat

	// validate Rhino sensitivity
	rhnSensitivityFloat := float32(*rhinoSensitivityArg)
	if rhnSensitivityFloat < 0 || rhnSensitivityFloat > 1 {
		log.Fatalf("Sensitivity value of '%f' is invalid. Must be between [0, 1].", rhnSensitivityFloat)
	}
	p.RhinoSensitivity = rhnSensitivityFloat

	// validate endpoint duration
	endpointDurationFloat := float32(*endpointDurationArg)
	if endpointDurationFloat < 0.5 || endpointDurationFloat > 5.0 {
		log.Fatalf("Endpoint duration value of '%f' is invalid. Must be between [0.5, 5.0].", endpointDurationFloat)
	}
	p.EndpointDurationSec = endpointDurationFloat

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

	recorder := pvrecorder.PvRecorder{
		DeviceIndex:    *audioDeviceIndex,
		FrameLength:    FrameLength,
		BufferSizeMSec: 1000,
		LogOverflow:    0,
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

	go func() {
		<-signalCh
		close(waitCh)
	}()

	log.Printf("Using device: %s", recorder.GetSelectedDevice())
	fmt.Println("Listening...")

waitLoop:
	for {
		select {
		case <-waitCh:
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
