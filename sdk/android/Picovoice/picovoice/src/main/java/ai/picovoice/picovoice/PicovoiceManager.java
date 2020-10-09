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

import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Process;

import java.util.concurrent.Callable;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

public class PicovoiceManager {
    private class MicrophoneReader {
        private AtomicBoolean started = new AtomicBoolean(false);
        private AtomicBoolean stop = new AtomicBoolean(false);
        private AtomicBoolean stopped = new AtomicBoolean(false);

        void start() throws PicovoiceException {
            if (started.get()) {
                return;
            }

            started.set(true);

            picovoice = new Picovoice(
                    porcupineModelPath,
                    keywordPath,
                    porcupineSensitivity,
                    wakeWordCallback,
                    rhinoModelPath,
                    contextPath,
                    rhinoSensitivity,
                    inferenceCallback);

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

        private void read() throws PicovoiceException {
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
            } catch (IllegalArgumentException | IllegalStateException e) {
                throw new PicovoiceException(e);
            } finally {
                if (audioRecord != null) {
                    audioRecord.release();
                }

                stopped.set(true);
            }
        }
    }

    private Picovoice picovoice = null;
    private final String porcupineModelPath;
    private final String keywordPath;
    private final float porcupineSensitivity;
    private final PicovoiceWakeWordCallback wakeWordCallback;
    private final String rhinoModelPath;
    private final String contextPath;
    private final float rhinoSensitivity;
    private final PicovoiceInferenceCallback inferenceCallback;
    private final MicrophoneReader microphoneReader;

    public PicovoiceManager(
            String porcupineModelPath,
            String keywordPath,
            float porcupineSensitivity,
            PicovoiceWakeWordCallback wakeWordCallback,
            String rhinoModelPath,
            String contextPath,
            float rhinoSensitivity,
            PicovoiceInferenceCallback inferenceCallback) {
        this.porcupineModelPath = porcupineModelPath;
        this.keywordPath = keywordPath;
        this.porcupineSensitivity = porcupineSensitivity;
        this.wakeWordCallback = wakeWordCallback;
        this.rhinoModelPath = rhinoModelPath;
        this.contextPath = contextPath;
        this.rhinoSensitivity = rhinoSensitivity;
        this.inferenceCallback = inferenceCallback;

        microphoneReader = new MicrophoneReader();
    }

    public void start() throws PicovoiceException {
        microphoneReader.start();
    }

    public void stop() throws PicovoiceException {
        try {
            microphoneReader.stop();
        } catch (InterruptedException e) {
            throw new PicovoiceException(e);
        }
    }

    public void delete() {
        picovoice.delete();
    }
}
