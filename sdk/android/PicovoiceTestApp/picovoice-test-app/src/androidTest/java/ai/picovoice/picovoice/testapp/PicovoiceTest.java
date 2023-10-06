package ai.picovoice.picovoice.testapp;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import ai.picovoice.picovoice.Picovoice;
import ai.picovoice.picovoice.PicovoiceException;

@RunWith(Enclosed.class)
public class PicovoiceTest {

    public static class StandardTests extends BaseTest {

        @Test
        public void testInitSuccessSimple() throws PicovoiceException {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            Picovoice p = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath.getAbsolutePath())
                    .setContextPath(contextPath.getAbsolutePath())
                    .setWakeWordCallback(wakeWordCallback)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            assertTrue(p.getVersion() != null && !p.getVersion().equals(""));
            assertTrue(p.getFrameLength() > 0);
            assertTrue(p.getSampleRate() > 0);
            assertTrue(p.getContextInformation() != null && !p.getContextInformation().equals(""));

            p.delete();
        }

        @Test
        public void testInitSuccessCustomModelPaths() throws PicovoiceException {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            File porcupineModelPath = new File(testResourcesPath, "porcupine_model_files/porcupine_params.pv");
            File rhinoModelPath = new File(testResourcesPath, "rhino_model_files/rhino_params.pv");
            Picovoice p = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath.getAbsolutePath())
                    .setContextPath(contextPath.getAbsolutePath())
                    .setPorcupineModelPath(porcupineModelPath.getAbsolutePath())
                    .setRhinoModelPath(rhinoModelPath.getAbsolutePath())
                    .setWakeWordCallback(wakeWordCallback)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            assertTrue(p.getContextInformation() != null && !p.getContextInformation().equals(""));

            p.delete();
        }

        @Test
        public void testInitSuccessCustomSensitivities() throws PicovoiceException {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            Picovoice p = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath.getAbsolutePath())
                    .setContextPath(contextPath.getAbsolutePath())
                    .setPorcupineSensitivity(0.7f)
                    .setRhinoSensitivity(0.35f)
                    .setWakeWordCallback(wakeWordCallback)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            assertTrue(p.getContextInformation() != null && !p.getContextInformation().equals(""));

            p.delete();
        }

        @Test
        public void testInitSuccessCustomEndpointSettings() throws PicovoiceException {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            Picovoice p = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath.getAbsolutePath())
                    .setContextPath(contextPath.getAbsolutePath())
                    .setEndpointDurationSec(3.0f)
                    .setRequireEndpoint(false)
                    .setWakeWordCallback(wakeWordCallback)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            assertTrue(p.getContextInformation() != null && !p.getContextInformation().equals(""));

            p.delete();
        }

        @Test
        public void testInitFailWithMismatchedPorcupineLanguage() {
            File keywordPath = new File(testResourcesPath, "keyword_files/fr/framboise_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithMismatchedRhinoLanguage() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/de/beleuchtung_android.rhn");

            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithInvalidKeywordPath() {
            File keywordPath = new File(testResourcesPath, "bad_path/bad_path.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithInvalidContextPath() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "bad_path/bad_path.rhn");
            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithInvalidPorcupineModelPath() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            File porcupineModelPath = new File(testResourcesPath, "bad_path/bad_path.pv");

            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setPorcupineModelPath(porcupineModelPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithInvalidRhinoModelPath() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
            File rhinoModelPath = new File(testResourcesPath, "bad_path/bad_path.pv");

            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setRhinoModelPath(rhinoModelPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithInvalidPorcupineSensitivity() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");

            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setPorcupineSensitivity(10)
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithInvalidRhinoSensitivity() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");

            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setRhinoSensitivity(-1)
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithWrongPorcupinePlatform() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/alexa_linux.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");

            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitFailWithWrongRhinoPlatform() {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_linux.rhn");

            boolean didFail = false;
            try {
                new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath(keywordPath.getAbsolutePath())
                        .setContextPath(contextPath.getAbsolutePath())
                        .setWakeWordCallback(wakeWordCallback)
                        .setInferenceCallback(inferenceCallback)
                        .build(appContext);

            } catch (PicovoiceException e) {
                didFail = true;
            }

            assertTrue(didFail);
        }

        @Test
        public void testInitWithNonAsciiModelName() throws PicovoiceException {
            File keywordPath = new File(testResourcesPath, "keyword_files/es/murciélago_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/es/iluminación_inteligente_android.rhn");
            File porcupineModelPath = new File(testResourcesPath, "porcupine_model_files/porcupine_params_es.pv");
            File rhinoModelPath = new File(testResourcesPath, "rhino_model_files/rhino_params_es.pv");
            Picovoice p = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath.getAbsolutePath())
                    .setContextPath(contextPath.getAbsolutePath())
                    .setPorcupineModelPath(porcupineModelPath.getAbsolutePath())
                    .setRhinoModelPath(rhinoModelPath.getAbsolutePath())
                    .setWakeWordCallback(wakeWordCallback)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            assertTrue(p.getContextInformation() != null && !p.getContextInformation().equals(""));

            p.delete();
        }

        @Test
        public void testReset() throws PicovoiceException {
            File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");

            Picovoice p = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath)
                    .setContextPath(contextPath)
                    .setWakeWordCallback(wakeWordCallback)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            File testAudio = new File(testResourcesPath, "audio_samples/picovoice-coffee.wav");

            processTestHelper(p, testAudio, 20);
            Thread.sleep(500);

            assertFalse(isWakeWordDetected);
            assertNull(inferenceResult);

            isWakeWordDetected = false;
            inferenceResult = null;
            p.reset();
            assertFalse(isWakeWordDetected);

            processTestAudio(p, testAudio);
            Thread.sleep(500);

            assertTrue(isWakeWordDetected);
            assertNotNull(inferenceResult);
            assertTrue(inferenceResult.getIsUnderstood());

            p.reset();
            assertFalse(isWakeWordDetected);

            p.delete();
        }
    }

    @RunWith(Parameterized.class)
    public static class LanguageTests extends BaseTest {

        @Parameterized.Parameter(value = 0)
        public String porcupineModelFile;

        @Parameterized.Parameter(value = 1)
        public String rhinoModelFile;

        @Parameterized.Parameter(value = 2)
        public String keywordFile;

        @Parameterized.Parameter(value = 3)
        public String contextFile;

        @Parameterized.Parameter(value = 4)
        public String testAudioFile;

        @Parameterized.Parameter(value = 5)
        public String expectedIntent;

        @Parameterized.Parameter(value = 6)
        public Map<String, String> expectedSlots;

        @Parameterized.Parameters(name = "{4}")
        public static Collection<Object[]> initParameters() throws IOException {
            String testDataJsonString = getTestDataString();

            JsonObject testDataJson = JsonParser.parseString(testDataJsonString).getAsJsonObject();
            JsonArray testParametersJson = testDataJson.getAsJsonObject("tests").getAsJsonArray("parameters");

            List<Object[]> parameters = new ArrayList<>();
            for (int i = 0; i < testParametersJson.size(); i++) {
                JsonObject testData = testParametersJson.get(i).getAsJsonObject();
                String language = testData.get("language").getAsString();
                String wakeword = testData.get("wakeword").getAsString();
                String contextName = testData.get("context_name").getAsString();
                String audioFilename = testData.get("audio_file").getAsString();
                JsonObject inferenceJson = testData.getAsJsonObject("inference");

                String porcupineModelFile = String.format("porcupine_model_files/porcupine_params_%s.pv", language);
                String rhinoModelFile = String.format("rhino_model_files/rhino_params_%s.pv", language);
                String keywordFile = String.format("keyword_files/%s/%s_android.ppn", language, wakeword);
                String contextFile = String.format("context_files/%s/%s_android.rhn", language, contextName);
                String audioFile = String.format("audio_samples/%s", audioFilename);

                String intent = inferenceJson.get("intent").getAsString();
                HashMap<String, String> slots = new HashMap<String, String>();
                for (Map.Entry<String, JsonElement> entry : inferenceJson.getAsJsonObject("slots").asMap().entrySet()) {
                    slots.put(entry.getKey(), entry.getValue().getAsString());
                }

                if (Objects.equals(language, "en")) {
                    porcupineModelFile = "porcupine_model_files/porcupine_params.pv";
                    rhinoModelFile = "rhino_model_files/rhino_params.pv";
                }

                parameters.add(new Object[] {
                        porcupineModelFile,
                        rhinoModelFile,
                        keywordFile,
                        contextFile,
                        audioFile,
                        intent,
                        slots,
                });
            }

            return parameters;
        }

        @Test
        public void testProcess() throws Exception {

            String porcupineModelPath = new File(testResourcesPath, porcupineModelFile).getAbsolutePath();
            String rhinoModelPath = new File(testResourcesPath, rhinoModelFile).getAbsolutePath();
            String keywordPath = new File(testResourcesPath, keywordFile).getAbsolutePath();
            String contextPath = new File(testResourcesPath, contextFile).getAbsolutePath();

            Picovoice p = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setPorcupineModelPath(porcupineModelPath)
                    .setRhinoModelPath(rhinoModelPath)
                    .setKeywordPath(keywordPath)
                    .setContextPath(contextPath)
                    .setWakeWordCallback(wakeWordCallback)
                    .setInferenceCallback(inferenceCallback)
                    .build(appContext);

            File testAudio = new File(testResourcesPath, testAudioFile);

            processTestAudio(p, testAudio);
            Thread.sleep(500);

            assertTrue(isWakeWordDetected);
            assertNotNull(inferenceResult);
            assertTrue(inferenceResult.getIsUnderstood());
            assertEquals(expectedIntent, inferenceResult.getIntent());
            assertEquals(expectedSlots, inferenceResult.getSlots());

            isWakeWordDetected = false;
            inferenceResult = null;

            // test again
            processTestAudio(p, testAudio);
            Thread.sleep(500);

            assertTrue(isWakeWordDetected);
            assertNotNull(inferenceResult);
            assertTrue(inferenceResult.getIsUnderstood());
            assertEquals(expectedIntent, inferenceResult.getIntent());
            assertEquals(expectedSlots, inferenceResult.getSlots());

            p.delete();
        }
    }
}
