// Copyright 2021-2023 Picovoice Inc.
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
	"path/filepath"

	. "github.com/Picovoice/picovoice/sdk/go/v3"
	rhn "github.com/Picovoice/rhino/binding/go/v3"
	"github.com/go-audio/audio"
	"github.com/go-audio/wav"
)

func main() {
	inputAudioPathArg := flag.String("input_audio_path", "", "Path to input audio file (mono, WAV, 16-bit, 16kHz)")
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
		"If set to `true`, Rhino requires an endpoint (chunk of silence) before finishing inference.")
	flag.Parse()

	// validate input audio
	if *inputAudioPathArg == "" {
		log.Fatal("No input audio file provided.")
	}
	inputAudioPath, _ := filepath.Abs(*inputAudioPathArg)
	f, err := os.Open(inputAudioPath)
	if err != nil {
		log.Fatalf("Unable to find or open input audio at %s", inputAudioPath)
	}
	defer f.Close()

	wavFile := wav.NewDecoder(f)
	if !wavFile.IsValidFile() || wavFile.BitDepth != 16 || wavFile.SampleRate != 16000 || wavFile.NumChans != 1 {
		log.Fatal("Invalid WAV file. File must contain mono, 16-bit, 16kHz linearly encoded PCM.")
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
	p.InferenceCallback = func(inferenceResult rhn.RhinoInference) {
		if inferenceResult.IsUnderstood {
			fmt.Println("{")
			fmt.Printf("  intent : '%s'\n", inferenceResult.Intent)
			fmt.Println("  slots : {")
			for k, v := range inferenceResult.Slots {
				fmt.Printf("    %s : '%s'\n", k, v)
			}
			fmt.Println("  }")
			fmt.Println("}")
		} else {
			fmt.Println("Didn't understand the command")
		}
	}

	err = p.Init()
	if err != nil {
		log.Fatal(err)
	}
	defer func() {
		err := p.Delete()
		if err != nil {
			log.Fatalf("Failed to release resources: %s", err)
		}
	}()

	buf := &audio.IntBuffer{
		Format: &audio.Format{
			NumChannels: 1,
			SampleRate:  16000,
		},
		Data:           make([]int, FrameLength),
		SourceBitDepth: 16,
	}

	shortBuf := make([]int16, FrameLength)
	var n int
	totalRead := 0
	for err == nil {
		n, err = wavFile.PCMBuffer(buf)
		if err != nil {
			log.Fatal("Failed to read from WAV file.", err)
		}

		if n == 0 {
			break
		}

		totalRead += n
		for i := range buf.Data {
			shortBuf[i] = int16(buf.Data[i])
		}

		err = p.Process(shortBuf)
		if err != nil {
			log.Fatal(err)
		}
	}
}
