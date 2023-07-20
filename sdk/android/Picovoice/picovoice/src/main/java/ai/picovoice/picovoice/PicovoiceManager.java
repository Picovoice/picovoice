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
import android.util.Log;

import ai.picovoice.android.voiceprocessor.VoiceProcessor;
import ai.picovoice.android.voiceprocessor.VoiceProcessorErrorListener;
import ai.picovoice.android.voiceprocessor.VoiceProcessorException;
import ai.picovoice.android.voiceprocessor.VoiceProcessorFrameListener;

/**
 * High-level Android binding for Picovoice end-to-end platform. It handles recording audio from
 * microphone, processes it in real-time ${@link Picovoice}, and notifies the client upon detection
 * of the wake word or completion of in voice command inference.
 */
public class PicovoiceManager {
    private final Context appContext;
    private final String accessKey;
    private final String porcupineModelPath;
    private final String keywordPath;
    private final float porcupineSensitivity;
    private final PicovoiceWakeWordCallback wakeWordCallback;
    private final String rhinoModelPath;
    private final String contextPath;
    private final float rhinoSensitivity;
    private final float endpointDurationSec;
    private final boolean requireEndpoint;
    private final PicovoiceInferenceCallback inferenceCallback;

    private final VoiceProcessor voiceProcessor;
    private final VoiceProcessorFrameListener vpFrameListener;
    private final VoiceProcessorErrorListener vpErrorListener;
    private boolean isListening;

    private Picovoice picovoice = null;

    /**
     * Private constructor.
     *
     * @param appContext           Android app context
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
     * @param requireEndpoint      Boolean variable to indicate if Rhino should wait for a chunk of
     *                             silence before finishing inference.
     * @param inferenceCallback    User-defined callback invoked upon completion of intent inference.
     *                             #{@link PicovoiceInferenceCallback} defines the interface of the
     *                             callback.
     * @param processErrorCallback A callback that reports errors encountered while processing audio.
     */
    private PicovoiceManager(Context appContext,
                             String accessKey,
                             String porcupineModelPath,
                             String keywordPath,
                             float porcupineSensitivity,
                             PicovoiceWakeWordCallback wakeWordCallback,
                             String rhinoModelPath,
                             String contextPath,
                             float rhinoSensitivity,
                             float endpointDurationSec,
                             boolean requireEndpoint,
                             PicovoiceInferenceCallback inferenceCallback,
                             final PicovoiceManagerErrorCallback processErrorCallback) {
        this.appContext = appContext;
        this.accessKey = accessKey;
        this.porcupineModelPath = porcupineModelPath;
        this.keywordPath = keywordPath;
        this.porcupineSensitivity = porcupineSensitivity;
        this.wakeWordCallback = wakeWordCallback;
        this.rhinoModelPath = rhinoModelPath;
        this.contextPath = contextPath;
        this.rhinoSensitivity = rhinoSensitivity;
        this.endpointDurationSec = endpointDurationSec;
        this.requireEndpoint = requireEndpoint;
        this.inferenceCallback = inferenceCallback;

        this.voiceProcessor = VoiceProcessor.getInstance();
        this.vpFrameListener = new VoiceProcessorFrameListener() {
            @Override
            public void onFrame(short[] frame) {
                synchronized (voiceProcessor) {
                    if (picovoice == null) {
                        return;
                    }
                    try {
                        picovoice.process(frame);
                    } catch (PicovoiceException e) {
                        if (processErrorCallback != null) {
                            processErrorCallback.invoke(new PicovoiceException(e));
                        } else {
                            Log.e("PicovoiceManager", e.toString());
                        }
                    }
                }
            }
        };
        this.vpErrorListener = new VoiceProcessorErrorListener() {
            @Override
            public void onError(VoiceProcessorException error) {
                if (processErrorCallback != null) {
                    processErrorCallback.invoke(new PicovoiceException(error));
                } else {
                    Log.e("PicovoiceManager", error.toString());
                }
            }
        };
    }

    /**
     * Starts recording audio from teh microphone and processes it using ${@link Picovoice}.
     *
     * @throws PicovoiceException if there is an error with initialization of Picovoice.
     */
    public void start() throws PicovoiceException {
        if (isListening) {
            return;
        }

        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setPorcupineModelPath(porcupineModelPath)
                .setKeywordPath(keywordPath)
                .setPorcupineSensitivity(porcupineSensitivity)
                .setWakeWordCallback(wakeWordCallback)
                .setRhinoModelPath(rhinoModelPath)
                .setContextPath(contextPath)
                .setRhinoSensitivity(rhinoSensitivity)
                .setEndpointDurationSec(endpointDurationSec)
                .setRequireEndpoint(requireEndpoint)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);
        this.voiceProcessor.addFrameListener(vpFrameListener);
        this.voiceProcessor.addErrorListener(vpErrorListener);

        try {
            voiceProcessor.start(picovoice.getFrameLength(), picovoice.getSampleRate());
        } catch (VoiceProcessorException e) {
            throw new PicovoiceException(e);
        }
        isListening = true;
    }

    /**
     * Stops recording audio from the microphone.
     *
     * @throws PicovoiceException if an error is encountered while attempting to stop.
     */
    public void stop() throws PicovoiceException {
        voiceProcessor.removeErrorListener(vpErrorListener);
        voiceProcessor.removeFrameListener(vpFrameListener);
        if (voiceProcessor.getNumFrameListeners() == 0) {
            try {
                voiceProcessor.stop();
            } catch (VoiceProcessorException e) {
                throw new PicovoiceException(e);
            }
        }

        synchronized (voiceProcessor) {
            picovoice.delete();
            picovoice = null;
        }
        isListening = false;
    }

    /**
     * Getter for the Rhino context.
     *
     * @return Rhino context
     */
    public String getContextInformation() throws PicovoiceException {
        return picovoice != null ? picovoice.getContextInformation() : "";
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
     * Getter for the version of Porcupine.
     *
     * @return Porcupine version
     */
    public String getPorcupineVersion() {
        return picovoice != null ? picovoice.getPorcupineVersion() : "";
    }

    /**
     * Getter for the version of Rhino.
     *
     * @return Rhino version
     */
    public String getRhinoVersion() {
        return picovoice != null ? picovoice.getRhinoVersion() : "";
    }

    /**
     * Builder for creating an instance of PicovoiceManager with a mixture of default arguments.
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

        private PicovoiceManagerErrorCallback processErrorCallback = null;

        /**
         * Setter for AccessKey.
         *
         * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
         */
        public PicovoiceManager.Builder setAccessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        /**
         * Setter for path to Porcupine model file.
         *
         * @param porcupineModelPath Absolute path to the file containing Porcupine's model parameters.
         */
        public PicovoiceManager.Builder setPorcupineModelPath(String porcupineModelPath) {
            this.porcupineModelPath = porcupineModelPath;
            return this;
        }

        /**
         * Setter for path to Porcupine keyword file.
         *
         * @param keywordPath Absolute path to Porcupine's keyword model file.
         */
        public PicovoiceManager.Builder setKeywordPath(String keywordPath) {
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
        public PicovoiceManager.Builder setPorcupineSensitivity(float porcupineSensitivity) {
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
        public PicovoiceManager.Builder setWakeWordCallback(PicovoiceWakeWordCallback wakeWordCallback) {
            this.wakeWordCallback = wakeWordCallback;
            return this;
        }

        /**
         * Setter for path to Rhino model file.
         *
         * @param rhinoModelPath Absolute path to the file containing Rhino's model parameters.
         */
        public PicovoiceManager.Builder setRhinoModelPath(String rhinoModelPath) {
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
        public PicovoiceManager.Builder setContextPath(String contextPath) {
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
        public PicovoiceManager.Builder setRhinoSensitivity(float rhinoSensitivity) {
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
        public PicovoiceManager.Builder setEndpointDurationSec(float endpointDurationSec) {
            this.endpointDurationSec = endpointDurationSec;
            return this;
        }

        /**
         * Setter for requireEndpoint.
         *
         * @param requireEndpoint Boolean variable to indicate if Rhino should wait for a chunk of
         *                        silence before finishing inference.
         */
        public PicovoiceManager.Builder setRequireEndpoint(boolean requireEndpoint) {
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
        public PicovoiceManager.Builder setInferenceCallback(PicovoiceInferenceCallback inferenceCallback) {
            this.inferenceCallback = inferenceCallback;
            return this;
        }

        /**
         * Setter for error callback.
         *
         * @param processErrorCallback User-defined callback invoked when an error is encountered while
         *                             processing audio. #{@link PicovoiceManagerErrorCallback} defines
         *                             the interface of the callback.
         */
        public PicovoiceManager.Builder setProcessErrorCallback(PicovoiceManagerErrorCallback processErrorCallback) {
            this.processErrorCallback = processErrorCallback;
            return this;
        }

        /**
         * Validates properties and creates an instance of the PicovoiceManager.
         *
         * @param appContext Android app context (for extracting Picovoice resources)
         * @return An instance of PicovoiceManager
         */
        public PicovoiceManager build(Context appContext) {
            return new PicovoiceManager(
                    appContext,
                    accessKey,
                    porcupineModelPath,
                    keywordPath,
                    porcupineSensitivity,
                    wakeWordCallback,
                    rhinoModelPath,
                    contextPath,
                    rhinoSensitivity,
                    endpointDurationSec,
                    requireEndpoint,
                    inferenceCallback,
                    processErrorCallback);
        }
    }
}
