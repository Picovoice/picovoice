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

import android.content.Context;
import android.os.Handler;
import android.os.Looper;

import ai.picovoice.porcupine.*;
import ai.picovoice.rhino.*;

/**
 * Android binding for Picovoice end-to-end platform. Picovoice enables building voice experiences
 * similar to Alexa but processes audio entirely on-device (offline).
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
    private final PicovoiceWakeWordCallback wakeWordCallback;
    private final PicovoiceInferenceCallback inferenceCallback;
    private Porcupine porcupine;
    private Rhino rhino;
    private boolean isWakeWordDetected = false;
    private final Handler callbackHandler = new Handler(Looper.getMainLooper());

    /**
     * Private Constructor.
     *
     * @param porcupine         An instance of Porcupine wake word engine
     * @param wakeWordCallback  User-defined callback invoked upon detection of the wake phrase.
     *                          ${@link PicovoiceWakeWordCallback} defines the interface of the
     *                          callback.
     * @param rhino             An instance of Rhino Speech-to-Intent engine
     * @param inferenceCallback User-defined callback invoked upon completion of intent inference.
     *                          #{@link PicovoiceInferenceCallback} defines the interface of the
     *                          callback.
     */
    private Picovoice(
            Porcupine porcupine,
            PicovoiceWakeWordCallback wakeWordCallback,
            Rhino rhino,
            PicovoiceInferenceCallback inferenceCallback) {

        this.porcupine = porcupine;
        this.wakeWordCallback = wakeWordCallback;
        this.rhino = rhino;
        this.inferenceCallback = inferenceCallback;
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
                if (isWakeWordDetected && wakeWordCallback != null) {
                    callbackHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            wakeWordCallback.invoke();
                        }
                    });
                }
            } else {
                if (rhino.process(pcm)) {
                    if (inferenceCallback != null) {
                        final RhinoInference inference = rhino.getInference();
                        callbackHandler.post(new Runnable() {
                            @Override
                            public void run() {
                                inferenceCallback.invoke(inference);
                            }
                        });
                    }
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
     * Getter for the version of Porcupine.
     *
     * @return Porcupine version
     */
    public String getPorcupineVersion() {
        return porcupine != null ? porcupine.getVersion() : "";
    }

    /**
     * Getter for the version of Rhino.
     *
     * @return Rhino version
     */
    public String getRhinoVersion() {
        return rhino != null ? rhino.getVersion() : "";
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

        private String porcupineModelPath = null;
        private String keywordPath = null;
        private float porcupineSensitivity = 0.5f;
        private PicovoiceWakeWordCallback wakeWordCallback = null;

        private String rhinoModelPath = null;
        private String contextPath = null;
        private float rhinoSensitivity = 0.5f;
        private float endpointDurationSec = 1.0f;
        private boolean requireEndpoint = true;
        private PicovoiceInferenceCallback inferenceCallback = null;

        /**
         * Setter for AccessKey.
         *
         * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
         */
        public Picovoice.Builder setAccessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        /**
         * Setter for path to Porcupine model file.
         *
         * @param porcupineModelPath Absolute path to the file containing Porcupine's model parameters.
         */
        public Picovoice.Builder setPorcupineModelPath(String porcupineModelPath) {
            this.porcupineModelPath = porcupineModelPath;
            return this;
        }

        /**
         * Setter for path to Porcupine keyword file.
         *
         * @param keywordPath Absolute path to Porcupine's keyword model file.
         */
        public Picovoice.Builder setKeywordPath(String keywordPath) {
            this.keywordPath = keywordPath;
            return this;
        }

        /**
         * Setter for wake word engine sensitivity.
         *
         * @param porcupineSensitivity Wake word detection sensitivity. It should be a number within
         *                             [0, 1]. A higher sensitivity results in fewer misses at the cost
         *                             of increasing the false alarm rate.
         */
        public Picovoice.Builder setPorcupineSensitivity(float porcupineSensitivity) {
            this.porcupineSensitivity = porcupineSensitivity;
            return this;
        }

        /**
         * Setter for wake word detection callback.
         *
         * @param wakeWordCallback User-defined callback invoked upon detection of the wake phrase.
         *                         ${@link PicovoiceWakeWordCallback} defines the interface of the
         *                         callback.
         */
        public Picovoice.Builder setWakeWordCallback(PicovoiceWakeWordCallback wakeWordCallback) {
            this.wakeWordCallback = wakeWordCallback;
            return this;
        }

        /**
         * Setter for path to Rhino model file.
         *
         * @param rhinoModelPath Absolute path to the file containing Rhino's model parameters.
         */
        public Picovoice.Builder setRhinoModelPath(String rhinoModelPath) {
            this.rhinoModelPath = rhinoModelPath;
            return this;
        }

        /**
         * Setter for path to Rhino context file.
         *
         * @param contextPath Absolute path to file containing context parameters. A context
         *                    represents the set of expressions (spoken commands), intents, and
         *                    intent arguments (slots) within a domain of interest.
         */
        public Picovoice.Builder setContextPath(String contextPath) {
            this.contextPath = contextPath;
            return this;
        }

        /**
         * Setter for inference engine sensitivity.
         *
         * @param rhinoSensitivity Inference sensitivity. It should be a number within [0, 1]. A
         *                         higher sensitivity value results in fewer misses at the cost of
         *                         (potentially) increasing the erroneous inference rate.
         */
        public Picovoice.Builder setRhinoSensitivity(float rhinoSensitivity) {
            this.rhinoSensitivity = rhinoSensitivity;
            return this;
        }

        /**
         * Setter for endpointDurationSec.
         *
         * @param endpointDurationSec Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
         *                            utterance that marks the end of spoken command. It should be a positive number
         *                            within [0.5, 5]. A lower endpoint duration reduces delay and improves
         *                            responsiveness. A higher endpoint duration assures Rhino doesn't return inference
         *                            pre-emptively in case the user pauses before finishing the request.
         */
        public Picovoice.Builder setEndpointDurationSec(float endpointDurationSec) {
            this.endpointDurationSec = endpointDurationSec;
            return this;
        }

        /**
         * Setter for requireEndpoint.
         *
         * @param requireEndpoint Boolean variable to indicate if Rhino should wait for a chunk of
         *                        silence before finishing inference.
         */
        public Picovoice.Builder setRequireEndpoint(boolean requireEndpoint) {
            this.requireEndpoint = requireEndpoint;
            return this;
        }

        /**
         * Setter for intent inference callback.
         *
         * @param inferenceCallback User-defined callback invoked upon completion of intent inference.
         *                          #{@link PicovoiceInferenceCallback} defines the interface of the
         *                          callback.
         */
        public Picovoice.Builder setInferenceCallback(PicovoiceInferenceCallback inferenceCallback) {
            this.inferenceCallback = inferenceCallback;
            return this;
        }

        /**
         * Validates properties and creates an instance of the Porcupine wake word engine.
         *
         * @param appContext Android app context (for extracting Porcupine resources)
         * @return An instance of Porcupine wake word engine
         * @throws PicovoiceException if there is an error while initializing Porcupine.
         */
        public Picovoice build(Context appContext) throws PicovoiceException {
            try {
                Porcupine porcupine = new Porcupine.Builder()
                        .setAccessKey(accessKey)
                        .setModelPath(porcupineModelPath)
                        .setKeywordPath(keywordPath)
                        .setSensitivity(porcupineSensitivity)
                        .build(appContext);

                if (!porcupine.getVersion().startsWith("2.2.")) {
                    final String message = String.format(
                            "Expected Porcupine library with version '2.2.x' but received %s",
                            porcupine.getVersion());
                    throw new PicovoiceRuntimeException(message);
                }

                Rhino rhino = new Rhino.Builder()
                        .setAccessKey(accessKey)
                        .setModelPath(rhinoModelPath)
                        .setContextPath(contextPath)
                        .setSensitivity(rhinoSensitivity)
                        .setEndpointDurationSec(endpointDurationSec)
                        .setRequireEndpoint(requireEndpoint)
                        .build(appContext);

                if (!rhino.getVersion().startsWith("2.2.")) {
                    final String message = String.format(
                            "Expected Rhino library with version '2.2.x' but received %s",
                            rhino.getVersion());
                    throw new PicovoiceRuntimeException(message);
                }

                return new Picovoice(
                        porcupine,
                        wakeWordCallback,
                        rhino,
                        inferenceCallback);
            } catch (PorcupineException | RhinoException e) {
                throw mapToPicovoiceException(e);
            }
        }
    }
}
