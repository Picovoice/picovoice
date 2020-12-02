/*
    Copyright 2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoice;

import ai.picovoice.porcupine.Porcupine;
import ai.picovoice.porcupine.PorcupineException;
import ai.picovoice.rhino.Rhino;
import ai.picovoice.rhino.RhinoException;

/**
 * Android binding for Picovoice end-to-end platform. Picovoice enables building voice experiences
 * similar to Alexa but runs entirely on-device (offline).
 * <p>
 * Picovoice detects utterances of a customizable wake word (phrase) within an incoming stream of
 * audio in real-time. After detection of wake word, it begins to infer the user's intent from the
 * follow-on spoken command. Upon detection of wake word and completion of voice command, it invokes
 * user-provided callbacks to signal these events.
 * <p>
 * Picovoice processes incoming audio in consecutive frames. The number of samples per frame is
 * ${@link #getFrameLength()}. The incoming audio needs to have a sample rate equal to
 * ${@link #getSampleRate()} and be 16-bit linearly-encoded. Picovoice operates on single-channel
 * audio. It uses Porcupine wake word engine for wake word detection and Rhino Speech-to-Intent
 * engine for intent inference.
 */
public class Picovoice {
    final private Porcupine porcupine;
    final private PicovoiceWakeWordCallback wakeWordCallback;
    private boolean isWakeWordDetected = false;
    final private Rhino rhino;
    final private PicovoiceInferenceCallback inferenceCallback;

    /**
     * Constructor
     *
     * @param porcupineModelPath   Absolute path to the file containing Porcupine's model parameters.
     * @param keywordPath          Absolute path to Porcupine's keyword model file.
     * @param porcupineSensitivity Wake word detection sensitivity. It should be a number within
     *                             [0, 1]. A higher sensitivity results in fewer misses at the cost
     *                             of increasing the false alarm rate.
     * @param wakeWordCallback     User-defined callback invoked upon detection of the wake phrase.
     *                             ${@link PicovoiceWakeWordCallback} defines the interface of the
     *                             callback.
     * @param rhinoModelPath       Absolute path to the file containing Rhino's model parameters.
     * @param contextPath          Absolute path to file containing context parameters. A context
     *                             represents the set of expressions (spoken commands), intents, and
     *                             intent arguments (slots) within a domain of interest.
     * @param rhinoSensitivity     Inference sensitivity. It should be a number within [0, 1]. A
     *                             higher sensitivity value results in fewer misses at the cost of
     *                             (potentially) increasing the erroneous inference rate.
     * @param inferenceCallback    User-defined callback invoked upon completion of intent inference.
     *                             #{@link PicovoiceInferenceCallback} defines the interface of the
     *                             callback.
     * @throws PicovoiceException if there is an error while initializing.
     */
    public Picovoice(
            String porcupineModelPath,
            String keywordPath,
            float porcupineSensitivity,
            PicovoiceWakeWordCallback wakeWordCallback,
            String rhinoModelPath,
            String contextPath,
            float rhinoSensitivity,
            PicovoiceInferenceCallback inferenceCallback) throws PicovoiceException {
        try {
            porcupine = new Porcupine(porcupineModelPath, keywordPath, porcupineSensitivity);

            if (!porcupine.getVersion().startsWith("1.8.")) {
                final String message = String.format(
                        "Expected Porcupine library with version '1.8.x' but received %s",
                        porcupine.getVersion());
                throw new PicovoiceException(message);
            }

            this.wakeWordCallback = wakeWordCallback;

            rhino = new Rhino(rhinoModelPath, contextPath, rhinoSensitivity);
            if (!rhino.getVersion().startsWith("1.5.")) {
                final String message = String.format(
                        "Expected Rhino library with version '1.5.x' but received %s",
                        rhino.getVersion());
                throw new PicovoiceException(message);
            }

            this.inferenceCallback = inferenceCallback;
        } catch (PorcupineException | RhinoException e) {
            throw new PicovoiceException(e);
        }
    }

    /**
     * Releases resources acquired.
     */
    public void delete() {
        porcupine.delete();
        rhino.delete();
    }

    /**
     * Processes a frame of the incoming audio stream. Upon detection of wake word and completion
     * of follow-on command inference invokes user-defined callbacks.
     *
     * @param pcm A frame of audio samples. The number of samples per frame can be attained by calling
     *            ${@link #getFrameLength()}. The incoming audio needs to have a sample rate equal
     *            to ${@link #getSampleRate()} and be 16-bit linearly-encoded. Picovoice operates on
     *            single-channel audio.
     * @throws PicovoiceException if there is an error while processing the audio frame.
     */
    public void process(short[] pcm) throws PicovoiceException {
        try {
            if (!isWakeWordDetected) {
                isWakeWordDetected = (porcupine.process(pcm) == 0);
                if (isWakeWordDetected) {
                    wakeWordCallback.invoke();
                }
            } else {
                if (rhino.process(pcm)) {
                    inferenceCallback.invoke(rhino.getInference());
                    isWakeWordDetected = false;
                }
            }
        } catch (PorcupineException | RhinoException e) {
            throw new PicovoiceException(e);
        }
    }

    /**
     * Getter for version.
     *
     * @return Version.
     */
    public String getVersion() {
        return "1.1.0";
    }

    /**
     * Getter for number of audio samples per frame..
     *
     * @return Number of audio samples per frame.
     */
    public int getFrameLength() {
        return rhino.getFrameLength();
    }

    /**
     * Getter for audio sample rate accepted by Picovoice.
     *
     * @return Audio sample rate accepted by Picovoice.
     */
    public int getSampleRate() {
        return porcupine.getSampleRate();
    }
}
