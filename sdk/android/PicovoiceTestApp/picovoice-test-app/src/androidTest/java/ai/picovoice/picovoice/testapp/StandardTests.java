package ai.picovoice.picovoice.testapp;

import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.File;

import ai.picovoice.picovoice.Picovoice;
import ai.picovoice.picovoice.PicovoiceException;
import androidx.test.ext.junit.runners.AndroidJUnit4;

@RunWith(AndroidJUnit4.class)
public class StandardTests extends BaseTest {
    @Test
    public void testInitSuccessSimple() throws PicovoiceException {
        File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(keywordPath.getAbsolutePath())
                .setContextPath(contextPath.getAbsolutePath())
                .setWakeWordCallback(wakeWordCallback)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        assertTrue(picovoice.getVersion() != null && !picovoice.getVersion().equals(""));
        assertTrue(picovoice.getFrameLength() > 0);
        assertTrue(picovoice.getSampleRate() > 0);
        assertTrue(picovoice.getContextInformation() != null && !picovoice.getContextInformation().equals(""));
    }

    @Test
    public void testInitSuccessCustomModelPaths() throws PicovoiceException {
        File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
        File porcupineModelPath = new File(testResourcesPath, "porcupine_model_files/porcupine_params.pv");
        File rhinoModelPath = new File(testResourcesPath, "rhino_model_files/rhino_params.pv");
        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(keywordPath.getAbsolutePath())
                .setContextPath(contextPath.getAbsolutePath())
                .setPorcupineModelPath(porcupineModelPath.getAbsolutePath())
                .setRhinoModelPath(rhinoModelPath.getAbsolutePath())
                .setWakeWordCallback(wakeWordCallback)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        assertTrue(picovoice.getContextInformation() != null && !picovoice.getContextInformation().equals(""));
    }

    @Test
    public void testInitSuccessCustomSensitivities() throws PicovoiceException {
        File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(keywordPath.getAbsolutePath())
                .setContextPath(contextPath.getAbsolutePath())
                .setPorcupineSensitivity(0.7f)
                .setRhinoSensitivity(0.35f)
                .setWakeWordCallback(wakeWordCallback)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        assertTrue(picovoice.getContextInformation() != null && !picovoice.getContextInformation().equals(""));
    }

    @Test
    public void testInitSuccessCustomEndpointSettings() throws PicovoiceException {
        File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(keywordPath.getAbsolutePath())
                .setContextPath(contextPath.getAbsolutePath())
                .setEndpointDurationSec(3.0f)
                .setRequireEndpoint(false)
                .setWakeWordCallback(wakeWordCallback)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        assertTrue(picovoice.getContextInformation() != null && !picovoice.getContextInformation().equals(""));
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
        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(keywordPath.getAbsolutePath())
                .setContextPath(contextPath.getAbsolutePath())
                .setPorcupineModelPath(porcupineModelPath.getAbsolutePath())
                .setRhinoModelPath(rhinoModelPath.getAbsolutePath())
                .setWakeWordCallback(wakeWordCallback)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        assertTrue(picovoice.getContextInformation() != null && !picovoice.getContextInformation().equals(""));
    }

    @Test
    public void testReset() throws Exception {
        File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");

        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(keywordPath.getAbsolutePath())
                .setContextPath(contextPath.getAbsolutePath())
                .setWakeWordCallback(() -> {
                    try {
                        isWakeWordDetected = true;
                        picovoice.reset();
                    } catch (PicovoiceException e) {
                        assertNull(e);
                    }
                })
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        File testAudio = new File(testResourcesPath, "audio_samples/picovoice-coffee.wav");

        inferenceResult = null;
        processTestAudio(picovoice, testAudio);
        Thread.sleep(500);

        assertTrue(isWakeWordDetected);
        assertNull(inferenceResult);
    }
}
