// Copyright 2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is
// located in the "LICENSE" file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the
// License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
// express or implied. See the License for the specific language governing permissions and
// limitations under the License.
//

package picovoice

import (
	"fmt"
	"os"

	ppn "github.com/Picovoice/porcupine/binding/go"
	rhn "github.com/Picovoice/rhino/binding/go"
)

type PvStatus int

const (
	SUCCESS          PvStatus = 0
	OUT_OF_MEMORY    PvStatus = 1
	IO_ERROR         PvStatus = 2
	INVALID_ARGUMENT PvStatus = 3
	STOP_ITERATION   PvStatus = 4
	KEY_ERROR        PvStatus = 5
	INVALID_STATE    PvStatus = 6
)

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
	porcupine ppn.Porcupine

	rhino rhn.Rhino

	initialized bool

	wakeWordDetected bool

	KeywordPath string

	WakeWordCallback WakeWordCallbackType

	ContextPath string

	InferenceCallback InferenceCallbackType

	PorcupineModelPath string

	PorcupineSensitivity float32

	RhinoModelPath string

	RhinoSensitivity float32

	// Once initialized, stores the source of the Rhino context in YAML format. Shows the list of intents,
	// which expressions map to those intents, as well as slots and their possible values.
	ContextInfo string
}

func NewPicovoice(keywordPath string,
	wakewordCallback WakeWordCallbackType,
	contextPath string,
	inferenceCallback InferenceCallbackType) Picovoice {
	return Picovoice{
		KeywordPath:       keywordPath,
		WakeWordCallback:  wakewordCallback,
		ContextPath:       contextPath,
		InferenceCallback: inferenceCallback,

		PorcupineSensitivity: 0.5,
		RhinoSensitivity:     0.5,
	}
}

var (
	FrameLength      = ppn.FrameLength
	SampleRate       = ppn.SampleRate
	PorcupineVersion = ppn.Version
	RhinoVersion     = rhn.Version
	Version          = fmt.Sprintf("1.1.0 (Porcupine v%s) (Rhino v%s)", PorcupineVersion, RhinoVersion)
)

func (picovoice *Picovoice) Init() error {

	if picovoice.KeywordPath == "" {
		return fmt.Errorf("%s: No valid keyword was provided.", pvStatusToString(INVALID_ARGUMENT))
	}

	if _, err := os.Stat(picovoice.KeywordPath); os.IsNotExist(err) {
		return fmt.Errorf("%s: Keyword file file could not be found at %s", pvStatusToString(INVALID_ARGUMENT), picovoice.KeywordPath)
	}

	if picovoice.ContextPath == "" {
		return fmt.Errorf("%s: No valid context was provided.", pvStatusToString(INVALID_ARGUMENT))
	}

	if _, err := os.Stat(picovoice.ContextPath); os.IsNotExist(err) {
		return fmt.Errorf("%s: Context file could not be found at %s", pvStatusToString(INVALID_ARGUMENT), picovoice.ContextPath)
	}

	if ppn.SampleRate != rhn.SampleRate {
		return fmt.Errorf("%s: Pocupine sample rate (%d) was differenct than Rhino sample rate (%d)",
			pvStatusToString(INVALID_ARGUMENT),
			ppn.SampleRate,
			rhn.SampleRate)
	}

	if ppn.FrameLength != rhn.FrameLength {
		return fmt.Errorf("%s: Pocupine frame length (%d) was differenct than Rhino frame length (%d)",
			pvStatusToString(INVALID_ARGUMENT),
			ppn.FrameLength,
			rhn.FrameLength)
	}

	picovoice.porcupine = ppn.Porcupine{
		ModelPath:     picovoice.PorcupineModelPath,
		KeywordPaths:  []string{picovoice.KeywordPath},
		Sensitivities: []float32{0.5},
	}
	err := picovoice.porcupine.Init()
	if err != nil {
		return err
	}

	picovoice.rhino = rhn.Rhino{
		ModelPath:   picovoice.RhinoModelPath,
		ContextPath: picovoice.ContextPath,
	}
	err = picovoice.rhino.Init()
	if err != nil {
		return err
	}
	picovoice.ContextInfo = picovoice.rhino.ContextInfo
	picovoice.initialized = true
	return nil
}

func (picovoice *Picovoice) Delete() error {
	err := picovoice.porcupine.Delete()
	if err != nil {
		return err
	}

	err = picovoice.rhino.Delete()
	if err != nil {
		return err
	}

	picovoice.initialized = false
	return nil
}

func (picovoice *Picovoice) Process(pcm []int16) error {
	if !picovoice.initialized {
		return fmt.Errorf("Picovoice could not process because it has either not been initialized or has been deleted.")
	}

	if len(pcm) != FrameLength {
		return fmt.Errorf("Input data frame size (%d) does not match required size of %d", len(pcm), FrameLength)
	}

	if !picovoice.wakeWordDetected {
		keywordIndex, err := picovoice.porcupine.Process(pcm)
		if err != nil {
			return err
		}

		if keywordIndex == 0 {
			picovoice.wakeWordDetected = true
			if picovoice.WakeWordCallback != nil {
				picovoice.WakeWordCallback()
			}
		}
	} else {
		isFinalized, err := picovoice.rhino.Process(pcm)
		if err != nil {
			return err
		}
		if isFinalized {
			picovoice.wakeWordDetected = false
			inference, err := picovoice.rhino.GetInference()
			if err != nil {
				return err
			}

			if picovoice.InferenceCallback != nil {
				picovoice.InferenceCallback(inference)
			}
		}
	}
	return nil
}
