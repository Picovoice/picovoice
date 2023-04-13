/*
    Copyright 2020-2023 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoice;

import ai.picovoice.porcupine.*;
import ai.picovoice.rhino.*;

/**
 * Java binding for Picovoice end-to-end platform. Picovoice enables building voice experiences
 * similar to Alexa but runs entirely on-device (offline).
 *
 * <p>Picovoice detects utterances of a customizable wake word (phrase) within an incoming stream of
 * audio in real-time. After detection of wake word, it begins to infer the user's intent from the
 * follow-on spoken command. Upon detection of wake word and completion of voice command, it invokes
 * user-provided callbacks to signal these events.
 *
 * <p>Picovoice processes incoming audio in consecutive frames. The number of samples per frame is
 * ${@link #getFrameLength()}. The incoming audio needs to have a sample rate equal to
 * ${@link #getSampleRate()} and be 16-bit linearly-encoded. Picovoice operates on single-channel
 * audio. It uses Porcupine wake word engine for wake word detection and Rhino Speech-to-Intent
 * engine for intent inference.
 */
public class Picovoice {
    private Porcupine porcupine;
    private final PicovoiceWakeWordCallback wakeWordCallback;
    private boolean isWakeWordDetected = false;
    private Rhino rhino;
    private final PicovoiceInferenceCallback inferenceCallback;

    /**
     * Constructor.
     *
     * @param accessKey            AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
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
     * @param endpointDurationSec  Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
     *                             utterance that marks the end of spoken command. It should be a positive number
     *                             within [0.5, 5]. A lower endpoint duration reduces delay and improves
     *                             responsiveness. A higher endpoint duration assures Rhino doesn't return inference
     *                             pre-emptively in case the user pauses before finishing the request.
     * @param requireEndpoint      If set to `true`, Rhino requires an endpoint (a chunk of silence) after the
     *                             spoken command. If set to `false`, Rhino tries to detect silence, but if it cannot,
     *                             it still will provide inference regardless. Set to `false` only if operating in
     *                             an environment with overlapping speech (e.g. people talking in the background).
     * @param inferenceCallback    User-defined callback invoked upon completion of intent inference.
     *                             #{@link PicovoiceInferenceCallback} defines the interface of the
     *                             callback.
     * @throws PicovoiceException  if there is an error while initializing.
     */
    public Picovoice(
            String accessKey,
            String porcupineLibraryPath,
            String porcupineModelPath,
            String keywordPath,
            float porcupineSensitivity,
            PicovoiceWakeWordCallback wakeWordCallback,
            String rhinoLibraryPath,
            String rhinoModelPath,
            String contextPath,
            float rhinoSensitivity,
            float endpointDurationSec,
            boolean requireEndpoint,
            PicovoiceInferenceCallback inferenceCallback) throws PicovoiceException {

        if (wakeWordCallback == null) {
            final String message = String.format("Wake word callback is required");
            throw new PicovoiceInvalidArgumentException(message);
        }

        if (inferenceCallback == null) {
            final String message = String.format("Inference callback is required");
            throw new PicovoiceInvalidArgumentException(message);
        }

        try {
            porcupine = new Porcupine.Builder()
                    .setAccessKey(accessKey)
                    .setLibraryPath(porcupineLibraryPath)
                    .setModelPath(porcupineModelPath)
                    .setSensitivity(porcupineSensitivity)
                    .setKeywordPath(keywordPath)
                    .build();

            if (!porcupine.getVersion().startsWith("2.2.")) {
                final String message = String.format(
                        "Expected Porcupine library with version '2.2.x' but received %s",
                        porcupine.getVersion());
                throw new PicovoiceException(message);
            }

            this.wakeWordCallback = wakeWordCallback;

            rhino = new Rhino.Builder()
                    .setAccessKey(accessKey)
                    .setLibraryPath(rhinoLibraryPath)
                    .setModelPath(rhinoModelPath)
                    .setContextPath(contextPath)
                    .setSensitivity(rhinoSensitivity)
                    .setEndpointDuration(endpointDurationSec)
                    .setRequireEndpoint(requireEndpoint)
                    .build();

            if (!rhino.getVersion().startsWith("2.2.")) {
                final String message = String.format(
                        "Expected Rhino library with version '2.2.x' but received %s",
                        rhino.getVersion());
                throw new PicovoiceException(message);
            }

            if (rhino.getFrameLength() != porcupine.getFrameLength()) {
                final String message = String.format(
                        "Incompatible frame lengths for Porcupine and Rhino engines: '%d' and '%d' samples",
                        porcupine.getFrameLength(),
                        rhino.getFrameLength());
                throw new PicovoiceException(message);
            }

            if (rhino.getSampleRate() != porcupine.getSampleRate()) {
                final String message = String.format(
                        "Incompatible sample rates for Porcupine and Rhino engines: '%d' and '%d' Hz",
                        porcupine.getSampleRate(),
                        rhino.getSampleRate());
                throw new PicovoiceException(message);
            }

            this.inferenceCallback = inferenceCallback;
        } catch (PorcupineException | RhinoException e) {
            throw mapToPicovoiceException(e);
        }
    }

    /**
     * Releases resources acquired.
     */
    public void delete() {
        if (porcupine != null) {
            porcupine.delete();
            porcupine = null;
        }
        if (rhino != null) {
            rhino.delete();
            rhino = null;
        }
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
        if (porcupine == null || rhino == null) {
            throw new PicovoiceInvalidStateException("Cannot process frame - resources have been released");
        }

        if (pcm == null) {
            throw new PicovoiceInvalidArgumentException("Passed null frame to Picovoice process.");
        }

        if (pcm.length != getFrameLength()) {
            throw new PicovoiceInvalidArgumentException(
                    String.format("Picovoice process requires frames of length %d. " +
                            "Received frame of size %d.", getFrameLength(), pcm.length));
        }

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
            throw mapToPicovoiceException(e);
        }
    }

    /**
     * Getter for version.
     *
     * @return Version.
     */
    public String getVersion() {
        return "2.2.0";
    }

    /**
     * Getter for Porcupine version.
     *
     * @return Porcupine version.
     */
    public String getPorcupineVersion() {
        return porcupine != null ? porcupine.getVersion() : "";
    }

    /**
     * Getter for Rhino version.
     *
     * @return Rhino version.
     */
    public String getRhinoVersion() {
        return rhino != null ? rhino.getVersion() : "";
    }

    /**
     * Getter for number of audio samples per frame.
     *
     * @return Number of audio samples per frame.
     */
    public int getFrameLength() {
        return porcupine != null ? porcupine.getFrameLength() : 0;
    }

    /**
     * Getter for audio sample rate accepted by Picovoice.
     *
     * @return Audio sample rate accepted by Picovoice.
     */
    public int getSampleRate() {
        return porcupine != null ? porcupine.getSampleRate() : 0;
    }

    /**
     * Getter for the Rhino context.
     *
     * @return Rhino context
     */
    public String getContextInformation() throws PicovoiceException {
        try {
            return rhino != null ? rhino.getContextInformation() : "";
        } catch (RhinoException e) {
            throw mapToPicovoiceException(e);
        }
    }

    /**
     * Maps Porcupine/Rhino Exception to Picovoice Exception.
     */
    private static PicovoiceException mapToPicovoiceException(Exception e) {
        if (e instanceof PorcupineActivationException || e instanceof RhinoActivationException) {
            return new PicovoiceActivationException(e.getMessage(), e);
        } else if (e instanceof PorcupineActivationLimitException || e instanceof RhinoActivationLimitException) {
            return new PicovoiceActivationLimitException(e.getMessage(), e);
        } else if (e instanceof PorcupineActivationRefusedException || e instanceof RhinoActivationRefusedException) {
            return new PicovoiceActivationRefusedException(e.getMessage(), e);
        } else if (e instanceof PorcupineActivationThrottledException ||
                e instanceof RhinoActivationThrottledException) {
            return new PicovoiceActivationThrottledException(e.getMessage(), e);
        } else if (e instanceof PorcupineInvalidArgumentException || e instanceof RhinoInvalidArgumentException) {
            return new PicovoiceInvalidArgumentException(e.getMessage(), e);
        } else if (e instanceof PorcupineInvalidStateException || e instanceof RhinoInvalidStateException) {
            return new PicovoiceInvalidStateException(e.getMessage(), e);
        } else if (e instanceof PorcupineIOException || e instanceof RhinoIOException) {
            return new PicovoiceIOException(e.getMessage(), e);
        } else if (e instanceof PorcupineKeyException || e instanceof RhinoKeyException) {
            return new PicovoiceKeyException(e.getMessage(), e);
        } else if (e instanceof PorcupineMemoryException || e instanceof RhinoMemoryException) {
            return new PicovoiceMemoryException(e.getMessage(), e);
        } else if (e instanceof PorcupineRuntimeException || e instanceof RhinoRuntimeException) {
            return new PicovoiceRuntimeException(e.getMessage(), e);
        } else if (e instanceof PorcupineStopIterationException || e instanceof RhinoStopIterationException) {
            return new PicovoiceStopIterationException(e.getMessage(), e);
        } else if (e instanceof PorcupineException || e instanceof RhinoException) {
            return new PicovoiceException(e.getMessage(), e);
        } else {
            return new PicovoiceException(
                    String.format("Unknown exception: '%s', message: '%s'",
                            e.getClass().getSimpleName(),
                            e.getMessage()), e);
        }
    }

    /**
     * Builder for creating an instance of Picovoice with a mixture of default arguments.
     */
    public static class Builder {

        private String accessKey = null;
        private String porcupineLibraryPath = null;
        private String porcupineModelPath = null;
        private String keywordPath = null;
        private float porcupineSensitivity = 0.5f;
        private PicovoiceWakeWordCallback wakeWordCallback = null;
        private String rhinoLibraryPath = null;
        private String rhinoModelPath = null;
        private String contextPath = null;
        private float rhinoSensitivity = 0.5f;
        private float rhinoEndpointDuration = 1.0f;
        private boolean requireEndpoint = true;
        private PicovoiceInferenceCallback inferenceCallback = null;

        public Picovoice.Builder setAccessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        public Picovoice.Builder setPorcupineLibraryPath(String porcupineLibraryPath) {
            this.porcupineLibraryPath = porcupineLibraryPath;
            return this;
        }

        public Picovoice.Builder setPorcupineModelPath(String porcupineModelPath) {
            this.porcupineModelPath = porcupineModelPath;
            return this;
        }

        public Picovoice.Builder setKeywordPath(String keywordPath) {
            this.keywordPath = keywordPath;
            return this;
        }

        public Picovoice.Builder setPorcupineSensitivity(float porcupineSensitivity) {
            this.porcupineSensitivity = porcupineSensitivity;
            return this;
        }

        public Picovoice.Builder setWakeWordCallback(PicovoiceWakeWordCallback wakeWordCallback) {
            this.wakeWordCallback = wakeWordCallback;
            return this;
        }

        public Picovoice.Builder setRhinoLibraryPath(String rhinoLibraryPath) {
            this.rhinoLibraryPath = rhinoLibraryPath;
            return this;
        }

        public Picovoice.Builder setRhinoModelPath(String rhinoModelPath) {
            this.rhinoModelPath = rhinoModelPath;
            return this;
        }

        public Picovoice.Builder setContextPath(String contextPath) {
            this.contextPath = contextPath;
            return this;
        }

        public Picovoice.Builder setRhinoSensitivity(float rhinoSensitivity) {
            this.rhinoSensitivity = rhinoSensitivity;
            return this;
        }

        public Picovoice.Builder setRhinoEndpointDuration(float rhinoEndpointDuration) {
            this.rhinoEndpointDuration = rhinoEndpointDuration;
            return this;
        }

        public Picovoice.Builder setInferenceCallback(PicovoiceInferenceCallback inferenceCallback) {
            this.inferenceCallback = inferenceCallback;
            return this;
        }

        public Picovoice.Builder setRequireEndpoint(boolean requireEndpoint) {
            this.requireEndpoint = requireEndpoint;
            return this;
        }

        /**
         * Validates properties and creates an instance of the Picovoice end-to-end platform.
         *
         * @return An instance of Picovoice
         * @throws PicovoiceException if there is an error while initializing Picovoice.
         */
        public Picovoice build() throws PicovoiceException {
            return new Picovoice(
                    accessKey,
                    porcupineLibraryPath,
                    porcupineModelPath,
                    keywordPath,
                    porcupineSensitivity,
                    wakeWordCallback,
                    rhinoLibraryPath,
                    rhinoModelPath,
                    contextPath,
                    rhinoSensitivity,
                    rhinoEndpointDuration,
                    requireEndpoint,
                    inferenceCallback);
        }
    }
}
