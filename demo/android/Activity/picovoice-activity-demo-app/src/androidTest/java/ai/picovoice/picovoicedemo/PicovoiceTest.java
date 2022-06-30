package ai.picovoice.picovoicedemo;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.experimental.runners.Enclosed;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.io.File;
import java.util.Arrays;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;

import ai.picovoice.picovoice.Picovoice;
import ai.picovoice.picovoice.PicovoiceException;

@RunWith(Enclosed.class)
public class PicovoiceTest {

    public static class StandardTests extends BaseTest {

        @Test
        public void testInitSuccessSimple() throws PicovoiceException {
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/test_de_android.rhn");

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
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");
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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");

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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");

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
            File keywordPath = new File(testResourcesPath, "keyword_files/alexa_linux.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_android.rhn");

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
            File keywordPath = new File(testResourcesPath, "keyword_files/picovoice_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/coffee_maker_linux.rhn");

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
            File keywordPath = new File(testResourcesPath, "keyword_files/murciélago_android.ppn");
            File contextPath = new File(testResourcesPath, "context_files/iluminación_inteligente_android.rhn");
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
        public static Collection<Object[]> initParameters() {
            return Arrays.asList(new Object[][]{
                    {
                            "porcupine_model_files/porcupine_params.pv",
                            "rhino_model_files/rhino_params.pv",
                            "keyword_files/picovoice_android.ppn",
                            "context_files/coffee_maker_android.rhn",
                            "audio_samples/picovoice-coffee.wav",
                            "orderBeverage",
                            new HashMap<String, String>() {{
                                put("size", "large");
                                put("beverage", "coffee");
                            }}
                    },
                    {
                            "porcupine_model_files/porcupine_params_es.pv",
                            "rhino_model_files/rhino_params_es.pv",
                            "keyword_files/manzana_android.ppn",
                            "context_files/iluminación_inteligente_android.rhn",
                            "audio_samples/manzana-luz_es.wav",
                            "changeColor",
                            new HashMap<String, String>() {{
                                put("location", "habitación");
                                put("color", "rosado");
                            }}
                    },
                    {
                            "porcupine_model_files/porcupine_params_de.pv",
                            "rhino_model_files/rhino_params_de.pv",
                            "keyword_files/heuschrecke_android.ppn",
                            "context_files/beleuchtung_android.rhn",
                            "audio_samples/heuschrecke-beleuchtung_de.wav",
                            "changeState",
                            new HashMap<String, String>() {{
                                put("state", "aus");
                            }}
                    },
                    {
                            "porcupine_model_files/porcupine_params_fr.pv",
                            "rhino_model_files/rhino_params_fr.pv",
                            "keyword_files/mon chouchou_android.ppn",
                            "context_files/éclairage_intelligent_android.rhn",
                            "audio_samples/mon-intelligent_fr.wav",
                            "changeColor",
                            new HashMap<String, String>() {{
                                put("color", "violet");
                            }}
                    },
                    {
                            "porcupine_model_files/porcupine_params_it.pv",
                            "rhino_model_files/rhino_params_it.pv",
                            "keyword_files/cameriere_android.ppn",
                            "context_files/illuminazione_android.rhn",
                            "audio_samples/cameriere-luce_it.wav",
                            "spegnereLuce",
                            new HashMap<String, String>() {{
                                put("luogo", "bagno");
                            }}
                    },
                    {
                            "porcupine_model_files/porcupine_params_ja.pv",
                            "rhino_model_files/rhino_params_ja.pv",
                            "keyword_files/ninja_android.ppn",
                            "context_files/sumāto_shōmei_android.rhn",
                            "audio_samples/ninja-sumāto-shōmei_ja.wav",
                            "色変更",
                            new HashMap<String, String>() {{
                                put("色", "オレンジ");
                            }}
                    },
                    {
                            "porcupine_model_files/porcupine_params_ko.pv",
                            "rhino_model_files/rhino_params_ko.pv",
                            "keyword_files/koppulso_android.ppn",
                            "context_files/seumateu_jomyeong_android.rhn",
                            "audio_samples/koppulso-seumateu-jomyeong_ko.wav",
                            "changeColor",
                            new HashMap<String, String>() {{
                                put("color", "파란색");
                            }}
                    },
                    {
                            "porcupine_model_files/porcupine_params_pt.pv",
                            "rhino_model_files/rhino_params_pt.pv",
                            "keyword_files/abacaxi_android.ppn",
                            "context_files/luz_inteligente_android.rhn",
                            "audio_samples/abaxi-luz_pt.wav",
                            "ligueLuz",
                            new HashMap<String, String>() {{
                                put("lugar", "cozinha");
                            }}
                    },
            });
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