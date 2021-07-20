/*
    Copyright 2020-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoice;

import android.content.Context;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Handler;
import android.os.Looper;
import android.os.Process;
import android.util.Log;

import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * High-level Android binding for Picovoice end-to-end platform. It handles recording audio from
 * microphone, processes it in real-time ${@link Picovoice}, and notifies the client upon detection
 * of the wake word or completion of in voice command inference.
 */
public class PicovoiceManager {
    private final Context appContext;
    private final String porcupineModelPath;
    private final String keywordPath;
    private final float porcupineSensitivity;
    private final PicovoiceWakeWordCallback wakeWordCallback;
    private final String rhinoModelPath;
    private final String contextPath;
    private final float rhinoSensitivity;
    private final PicovoiceInferenceCallback inferenceCallback;
    private final PicovoiceManagerErrorCallback errorCallback;
    private final MicrophoneReader microphoneReader;
    private Picovoice picovoice = null;

    /**
     * Private constructor.
     *
     * @param appContext           Android app context
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
     * @param errorCallback        A callback that reports errors encountered while processing audio.
     */
    public PicovoiceManager(Context appContext,
                            String porcupineModelPath,
                            String keywordPath,
                            float porcupineSensitivity,
                            PicovoiceWakeWordCallback wakeWordCallback,
                            String rhinoModelPath,
                            String contextPath,
                            float rhinoSensitivity,
                            PicovoiceInferenceCallback inferenceCallback,
                            PicovoiceManagerErrorCallback errorCallback) {
        this.appContext = appContext;
        this.porcupineModelPath = porcupineModelPath;
        this.keywordPath = keywordPath;
        this.porcupineSensitivity = porcupineSensitivity;
        this.wakeWordCallback = wakeWordCallback;
        this.rhinoModelPath = rhinoModelPath;
        this.contextPath = contextPath;
        this.rhinoSensitivity = rhinoSensitivity;
        this.inferenceCallback = inferenceCallback;
        this.errorCallback = errorCallback;

        microphoneReader = new MicrophoneReader();
    }

    /**
     * Starts recording audio from teh microphone and processes it using ${@link Picovoice}.
     *
     * @throws PicovoiceException if there is an error with initialization of Picovoice.
     */
    public void start() throws PicovoiceException {
        microphoneReader.start();
    }

    /**
     * Stops recording audio from the microphone.
     *
     * @throws PicovoiceException if the {@link PicovoiceManager.MicrophoneReader} throws an
     *                            exception while it's being stopped.
     */
    public void stop() throws PicovoiceException {
        try {
            microphoneReader.stop();
        } catch (InterruptedException e) {
            throw new PicovoiceException(e);
        }
    }

    /**
     * Getter for the Rhino context
     *
     * @return Rhino context
     */
    public String getContextInformation() {
        return picovoice != null ? picovoice.getContextInformation() : "";
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
     * Getter for the version of Porcupine
     *
     * @return Porcupine version
     */
    public String getPorcupineVersion() {
        return picovoice != null ? picovoice.getPorcupineVersion() : "";
    }

    /**
     * Getter for the version of Rhino
     *
     * @return Rhino version
     */
    public String getRhinoVersion() {
        return picovoice != null ? picovoice.getRhinoVersion() : "";
    }

    /**
     * Builder for creating an instance of PicovoiceManager with a mixture of default arguments
     */
    public static class Builder {

        private String porcupineModelPath = null;
        private String keywordPath = null;
        private float porcupineSensitivity = 0.5f;
        private PicovoiceWakeWordCallback wakeWordCallback = null;

        private String rhinoModelPath = null;
        private String contextPath = null;
        private float rhinoSensitivity = 0.5f;
        private PicovoiceInferenceCallback inferenceCallback = null;

        private PicovoiceManagerErrorCallback errorCallback = null;

        /**
         * Setter for path to Porcupine model file
         *
         * @param porcupineModelPath Absolute path to the file containing Porcupine's model parameters.
         */
        public PicovoiceManager.Builder setPorcupineModelPath(String porcupineModelPath) {
            this.porcupineModelPath = porcupineModelPath;
            return this;
        }

        /**
         * Setter for path to Porcupine keyword file
         *
         * @param keywordPath Absolute path to Porcupine's keyword model file.
         */
        public PicovoiceManager.Builder setKeywordPath(String keywordPath) {
            this.keywordPath = keywordPath;
            return this;
        }

        /**
         * Setter for wake word engine sensitivity
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
         * Setter for wake word detection callback
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
         * Setter for path to Rhino model file
         *
         * @param rhinoModelPath Absolute path to the file containing Rhino's model parameters.
         */
        public PicovoiceManager.Builder setRhinoModelPath(String rhinoModelPath) {
            this.rhinoModelPath = rhinoModelPath;
            return this;
        }

        /**
         * Setter for path to Rhino context file
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
         * Setter for inference engine sensitivity
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
         * Setter for intent inference callback
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
         * Setter for error callback
         *
         * @param errorCallback User-defined callback invoked when an error is encountered while processing audio.
         *                      #{@link PicovoiceManagerErrorCallback} defines the interface of the
         *                      callback.
         */
        public PicovoiceManager.Builder setErrorCallback(PicovoiceManagerErrorCallback errorCallback) {
            this.errorCallback = errorCallback;
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
                    porcupineModelPath,
                    keywordPath,
                    porcupineSensitivity,
                    wakeWordCallback,
                    rhinoModelPath,
                    contextPath,
                    rhinoSensitivity,
                    inferenceCallback,
                    errorCallback);
        }
    }

    private class MicrophoneReader {
        private final AtomicBoolean started = new AtomicBoolean(false);
        private final AtomicBoolean stop = new AtomicBoolean(false);
        private final AtomicBoolean stopped = new AtomicBoolean(false);

        private final Handler callbackHandler = new Handler(Looper.getMainLooper());

        void start() throws PicovoiceException {
            if (started.get()) {
                return;
            }

            started.set(true);

            picovoice = new Picovoice.Builder()
                    .setPorcupineModelPath(porcupineModelPath)
                    .setKeywordPath(keywordPath)
                    .setPorcupineSensitivity(porcupineSensitivity)
                    .setWakeWordCallback(wakeWordCallback)
                    .setRhinoModelPath(rhinoModelPath)
                    .setContextPath(contextPath)
                    .setRhinoSensitivity(rhinoSensitivity)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            Executors.newSingleThreadExecutor().submit(new Callable<Void>() {
                @Override
                public Void call() throws PicovoiceException {
                    android.os.Process.setThreadPriority(Process.THREAD_PRIORITY_URGENT_AUDIO);
                    read();
                    return null;
                }
            });
        }

        void stop() throws InterruptedException {
            if (!started.get()) {
                return;
            }

            stop.set(true);

            while (!stopped.get()) {
                Thread.sleep(10);
            }

            started.set(false);
            stop.set(false);
            stopped.set(false);
        }

        private void read() {
            final int minBufferSize = AudioRecord.getMinBufferSize(
                    picovoice.getSampleRate(),
                    AudioFormat.CHANNEL_IN_MONO,
                    AudioFormat.ENCODING_PCM_16BIT);
            final int bufferSize = Math.max(picovoice.getSampleRate() / 2, minBufferSize);

            AudioRecord audioRecord = null;

            short[] buffer = new short[picovoice.getFrameLength()];

            try {
                audioRecord = new AudioRecord(
                        MediaRecorder.AudioSource.MIC,
                        picovoice.getSampleRate(),
                        AudioFormat.CHANNEL_IN_MONO,
                        AudioFormat.ENCODING_PCM_16BIT,
                        bufferSize);
                audioRecord.startRecording();

                while (!stop.get()) {
                    if (audioRecord.read(buffer, 0, buffer.length) == buffer.length) {
                        picovoice.process(buffer);
                    }
                }

                audioRecord.stop();
                picovoice.delete();
            } catch (final Exception e) {
                if (errorCallback != null) {
                    callbackHandler.post(new Runnable() {
                        @Override
                        public void run() {
                            errorCallback.invoke(new PicovoiceException(e));
                        }
                    });
                } else {
                    Log.e("PorcupineManager", e.toString());
                }
            } finally {
                if (audioRecord != null) {
                    audioRecord.release();
                }

                stopped.set(true);
            }
        }
    }
}
