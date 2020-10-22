/*
    Copyright 2018-2020 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoice;

import ai.picovoice.rhino.RhinoInference;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

public class PicovoiceTest {

    private Picovoice picovoice;
    private final String environmentName = getEnvironmentName();
    private final String keywordPath = String.format("../../resources/porcupine/resources/keyword_files" +
            "/%s/picovoice_%s.ppn", environmentName, environmentName);
    private final String contextPath = String.format("../../resources/rhino/resources/contexts" +
            "/%s/coffee_maker_%s.rhn", environmentName, environmentName);

    private boolean isWakeWordDetected = false;
    private final PicovoiceWakeWordCallback wakeWordCallback = new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            isWakeWordDetected = true;
        }
    };

    private RhinoInference inferenceResult;
    private final PicovoiceInferenceCallback inferenceCallback = new PicovoiceInferenceCallback() {
        @Override
        public void invoke(RhinoInference inference) {
            inferenceResult = inference;
        }
    };

    @BeforeEach
    void setUp() throws PicovoiceException {
        picovoice = new Picovoice.Builder()
                .setKeywordPath(keywordPath)
                .setWakeWordCallback(wakeWordCallback)
                .setContextPath(contextPath)
                .setInferenceCallback(inferenceCallback)
                .build();

        isWakeWordDetected = false;
        inferenceResult = null;
    }

    @AfterEach
    void tearDown() {
        picovoice.delete();
    }

    @Test
    void getFrameLength() {
        assertTrue(picovoice.getFrameLength() > 0);
    }

    @Test
    void getSampleRate() {
        assertTrue(picovoice.getSampleRate() > 0);
    }

    @Test
    void testProcess() throws PicovoiceException, IOException, UnsupportedAudioFileException {
        int frameLen = picovoice.getFrameLength();
        File testAudioPath = new File("../../resources/audio_samples/picovoice-coffee.wav");

        AudioInputStream audioInputStream = AudioSystem.getAudioInputStream(testAudioPath);
        assertEquals(audioInputStream.getFormat().getFrameRate(), 16000);

        int byteDepth = audioInputStream.getFormat().getFrameSize();
        byte[] pcm = new byte[frameLen * byteDepth];
        short[] picovoiceFrame = new short[frameLen];
        int numBytesRead;
        while ((numBytesRead = audioInputStream.read(pcm)) != -1) {

            if (numBytesRead / byteDepth == frameLen) {
                ByteBuffer.wrap(pcm).order(ByteOrder.LITTLE_ENDIAN).asShortBuffer().get(picovoiceFrame);
                picovoice.process(picovoiceFrame);
            }
        }

        assertTrue(isWakeWordDetected);
        assertEquals(inferenceResult.getIntent(), "orderDrink");
        Map<String, String> expectedSlotValues = new HashMap<>() {{
            put("size", "large");
            put("coffeeDrink", "coffee");
        }};
        assertEquals(expectedSlotValues, inferenceResult.getSlots());
    }

    @Test
    void testProcessAgain() throws PicovoiceException, IOException, UnsupportedAudioFileException {
        testProcess();
    }

    private String getEnvironmentName() {
        String arch = System.getProperty("os.arch");
        if (arch.equals("amd64") || arch.equals("x86_64")) {
            String os = System.getProperty("os.name", "generic").toLowerCase(Locale.ENGLISH);
            if (os.contains("mac") || os.contains("darwin")) {
                return "mac";
            } else if (os.contains("win")) {
                return "windows";
            } else if (os.contains("linux")) {
                return "linux";
            } else {
                throw new RuntimeException("Execution environment not supported. Picovoice " +
                        "Java is supported on MacOS, Linux and Windows");
            }
        } else {
            throw new RuntimeException(String.format("Platform architecture (%s) not supported. " +
                    "Picovoice Java is only supported on amd64 and x86_64 architectures.", arch));
        }
    }
}