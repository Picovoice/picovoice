// Copyright 2021-2022 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is
// located in the "LICENSE" file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the
// License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing permissions and
// limitations under the License.
//

// Go binding for Picovoice end-to-end platform. Picovoice enables building voice experiences similar to Alexa but
// runs entirely on-device (offline).

// Picovoice detects utterances of a customizable wake word (phrase) within an incoming stream of audio in real-time.
// After detection of wake word, it begins to infer the user's intent from the follow-on spoken command. Upon detection
// of wake word and completion of voice command, it invokes user-provided callbacks to signal these events.

// Picovoice processes incoming audio in consecutive frames. The number of samples per frame is
// `FrameLength`. The incoming audio needs to have a sample rate equal to `SampleRate` and be 16-bit
// linearly-encoded. Picovoice operates on single-channel audio. It uses Porcupine wake word engine for wake word
// detection and Rhino Speech-to-Intent engine for intent inference.

package picovoice

import (
	"fmt"

	ppn "github.com/Picovoice/porcupine/binding/go/v2"
	rhn "github.com/Picovoice/rhino/binding/go/v2"
)

// PvStatus describes error codes returned from native code
type PvStatus int

const (
	SUCCESS                  PvStatus = 0
	OUT_OF_MEMORY            PvStatus = 1
	IO_ERROR                 PvStatus = 2
	INVALID_ARGUMENT         PvStatus = 3
	STOP_ITERATION           PvStatus = 4
	KEY_ERROR                PvStatus = 5
	INVALID_STATE            PvStatus = 6
	RUNTIME_ERROR            PvStatus = 7
	ACTIVATION_ERROR         PvStatus = 8
	ACTIVATION_LIMIT_REACHED PvStatus = 9
	ACTIVATION_THROTTLED     PvStatus = 10
	ACTIVATION_REFUSED       PvStatus = 11
)

type PicovoiceError struct {
	StatusCode PvStatus
	Message    string
	InnerError error
}

func (e *PicovoiceError) Error() string {
	if e.InnerError != nil {
		return e.InnerError.Error()
	} else {
		return fmt.Sprintf("%s: %s", pvStatusToString(e.StatusCode), e.Message)
	}
}

func pvStatusToString(status PvStatus) string {
	switch status {
	case SUCCESS:
		return "SUCCESS"
	case OUT_OF_MEMORY:
		return "OUT_OF_MEMORY"
	case IO_ERROR:
		return "IO_ERROR"
	case INVALID_ARGUMENT:
		return "INVALID_ARGUMENT"
	case STOP_ITERATION:
		return "STOP_ITERATION"
	case KEY_ERROR:
		return "KEY_ERROR"
	case INVALID_STATE:
		return "INVALID_STATE"
	case RUNTIME_ERROR:
		return "RUNTIME_ERROR"
	case ACTIVATION_ERROR:
		return "ACTIVATION_ERROR"
	case ACTIVATION_LIMIT_REACHED:
		return "ACTIVATION_LIMIT_REACHED"
	case ACTIVATION_THROTTLED:
		return "ACTIVATION_THROTTLED"
	case ACTIVATION_REFUSED:
		return "ACTIVATION_REFUSED"
	default:
		return fmt.Sprintf("Unknown error code: %d", status)
	}
}

// Callback for when a wake word has been detected
type WakeWordCallbackType func()

// Callback for when Rhino has made an inference
type InferenceCallbackType func(rhn.RhinoInference)

// Picovoice struct
type Picovoice struct {
	// instance of porcupine
	porcupine ppn.Porcupine

	// instance of rhino
	rhino rhn.Rhino

	// only true after init and before delete
	initialized bool

	// true after Porcupine detected wake word
	wakeWordDetected bool

	// AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).
	AccessKey string

	// Path to Porcupine keyword file (.ppn)
	KeywordPath string

	// Function to be called once the wake word has been detected
	WakeWordCallback WakeWordCallbackType

	// Path to Rhino context file (.rhn)
	ContextPath string

	// Function to be called once Rhino has an inference ready
	InferenceCallback InferenceCallbackType

	// Path to Porcupine dynamic library file (.so/.dylib/.dll)
	PorcupineLibraryPath string

	// Path to Porcupine model file (.pv)
	PorcupineModelPath string

	// Sensitivity value for detecting keyword. The value should be a number within [0, 1]. A
	// higher sensitivity results in fewer misses at the cost of increasing the false alarm rate.
	PorcupineSensitivity float32

	// Path to Rhino dynamic library file (.so/.dylib/.dll)
	RhinoLibraryPath string

	// Path to Rhino model file (.pv)
	RhinoModelPath string

	// Inference sensitivity. A higher sensitivity value results in
	// fewer misses at the cost of (potentially) increasing the erroneous inference rate.
	// Sensitivity should be a floating-point number within 0 and 1.
	RhinoSensitivity float32

	// Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
	// utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
	// duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return inference
	// pre-emptively in case the user pauses before finishing the request.
	EndpointDurationSec float32

	// If set to `true`, Rhino requires an endpoint (chunk of silence) before finishing inference.
	RequireEndpoint bool

	// Once initialized, stores the source of the Rhino context in YAML format. Shows the list of intents,
	// which expressions map to those intents, as well as slots and their possible values.
	ContextInfo string
}

// Returns a Picovoice struct with default parameters
func NewPicovoice(
	accessKey string,
	keywordPath string,
	wakewordCallback WakeWordCallbackType,
	contextPath string,
	inferenceCallback InferenceCallbackType) Picovoice {
	return Picovoice{
		AccessKey:         accessKey,
		KeywordPath:       keywordPath,
		WakeWordCallback:  wakewordCallback,
		ContextPath:       contextPath,
		InferenceCallback: inferenceCallback,

		PorcupineSensitivity: 0.5,
		RhinoSensitivity:     0.5,
		EndpointDurationSec:  1.0,
		RequireEndpoint:      true,
	}
}

var (
	// Required number of audio samples per frame.
	FrameLength int

	// Required sample rate of input audio
	SampleRate int

	// Version of Porcupine being used
	PorcupineVersion string

	// Version of Rhino being used
	RhinoVersion string

	// Picovoice version
	Version string
)

// Init function for Picovoice. Must be called before attempting process.
func (picovoice *Picovoice) Init() error {

	if picovoice.WakeWordCallback == nil {
		return &PicovoiceError{
			StatusCode: INVALID_ARGUMENT,
			Message:    "No WakeWordCallback was provided",
		}
	}

	if picovoice.InferenceCallback == nil {
		return &PicovoiceError{
			StatusCode: INVALID_ARGUMENT,
			Message:    "No InferenceCallback was provided",
		}
	}

	if ppn.SampleRate != rhn.SampleRate {
		return &PicovoiceError{
			StatusCode: INVALID_ARGUMENT,
			Message: fmt.Sprintf(
				"Porcupine sample rate (%d) was different than Rhino sample rate (%d)",
				ppn.SampleRate,
				rhn.SampleRate),
		}
	}

	if ppn.FrameLength != rhn.FrameLength {
		return &PicovoiceError{
			StatusCode: INVALID_ARGUMENT,
			Message: fmt.Sprintf(
				"Porcupine frame length (%d) was different than Rhino frame length (%d)",
				ppn.FrameLength,
				rhn.FrameLength),
		}
	}

	picovoice.porcupine = ppn.Porcupine{
		AccessKey:     picovoice.AccessKey,
		LibraryPath:   picovoice.PorcupineLibraryPath,
		ModelPath:     picovoice.PorcupineModelPath,
		KeywordPaths:  []string{picovoice.KeywordPath},
		Sensitivities: []float32{picovoice.PorcupineSensitivity},
	}
	err := picovoice.porcupine.Init()
	if err != nil {
		return &PicovoiceError{
			InnerError: err,
		}
	}

	picovoice.rhino = rhn.Rhino{
		AccessKey:           picovoice.AccessKey,
		LibraryPath:         picovoice.RhinoLibraryPath,
		ModelPath:           picovoice.RhinoModelPath,
		ContextPath:         picovoice.ContextPath,
		Sensitivity:         picovoice.RhinoSensitivity,
		EndpointDurationSec: picovoice.EndpointDurationSec,
		RequireEndpoint:     picovoice.RequireEndpoint,
	}
	err = picovoice.rhino.Init()
	if err != nil {
		return &PicovoiceError{
			InnerError: err,
		}
	}

	FrameLength = ppn.FrameLength
	SampleRate = ppn.SampleRate
	PorcupineVersion = ppn.Version
	RhinoVersion = rhn.Version
	Version = fmt.Sprintf("2.2.0 (Porcupine v%s) (Rhino v%s)", PorcupineVersion, RhinoVersion)

	picovoice.ContextInfo = picovoice.rhino.ContextInfo
	picovoice.initialized = true
	return nil
}

// Releases resources acquired by Picovoice
func (picovoice *Picovoice) Delete() error {

	porcupineErr := picovoice.porcupine.Delete()
	rhinoErr := picovoice.rhino.Delete()

	if porcupineErr != nil {
		return &PicovoiceError{
			InnerError: porcupineErr,
		}
	}
	if rhinoErr != nil {
		return &PicovoiceError{
			InnerError: rhinoErr,
		}
	}

	picovoice.initialized = false
	return nil
}

// Process a frame of pcm audio with the Picovoice platform.
// Invokes user-defined callbacks upon detection of wake word and completion of follow-on command inference
func (picovoice *Picovoice) Process(pcm []int16) error {
	if !picovoice.initialized {
		return &PicovoiceError{
			StatusCode: INVALID_STATE,
			Message:    "Picovoice could not process because it has either not been initialized or has been deleted",
		}
	}

	if len(pcm) != FrameLength {
		return &PicovoiceError{
			StatusCode: INVALID_STATE,
			Message: fmt.Sprintf(
				"Input data frame size (%d) does not match required size of %d",
				len(pcm),
				FrameLength),
		}
	}

	if !picovoice.wakeWordDetected {
		keywordIndex, err := picovoice.porcupine.Process(pcm)
		if err != nil {
			return &PicovoiceError{
				InnerError: err,
			}
		}

		if keywordIndex == 0 {
			picovoice.wakeWordDetected = true
			picovoice.WakeWordCallback()
		}
	} else {
		isFinalized, err := picovoice.rhino.Process(pcm)
		if err != nil {
			return &PicovoiceError{
				InnerError: err,
			}
		}
		if isFinalized {
			picovoice.wakeWordDetected = false
			inference, err := picovoice.rhino.GetInference()
			if err != nil {
				return &PicovoiceError{
					InnerError: err,
				}
			}

			picovoice.InferenceCallback(inference)
		}
	}
	return nil
}
