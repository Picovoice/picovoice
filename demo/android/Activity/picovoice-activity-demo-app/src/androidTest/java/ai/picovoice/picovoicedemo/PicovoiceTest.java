package ai.picovoice.picovoicedemo;

import android.content.Context;
import android.content.res.AssetManager;

import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;

import com.microsoft.appcenter.espresso.Factory;
import com.microsoft.appcenter.espresso.ReportHelper;

import org.junit.After;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Map;


import ai.picovoice.picovoice.Picovoice;
import ai.picovoice.picovoice.PicovoiceException;
import ai.picovoice.picovoice.PicovoiceInferenceCallback;
import ai.picovoice.picovoice.PicovoiceWakeWordCallback;
import ai.picovoice.rhino.RhinoInference;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

@RunWith(AndroidJUnit4.class)
public class PicovoiceTest {

    @Rule
    public ReportHelper reportHelper = Factory.getReportHelper();
    boolean isInitialized = false;
    Context testContext;
    Context appContext;
    AssetManager assetManager;
    String testResourcesPath;
    String accessKey;

    boolean isWakeWordDetected = false;
    PicovoiceWakeWordCallback wakeWordCallback = new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            isWakeWordDetected = true;
        }
    };

    RhinoInference inferenceResult = null;
    PicovoiceInferenceCallback inferenceCallback = new PicovoiceInferenceCallback() {
        @Override
        public void invoke(RhinoInference inference) {
            inferenceResult = inference;
        }
    };

    @After
    public void TearDown() {
        isWakeWordDetected = false;
        inferenceResult = null;
        reportHelper.label("Stopping App");
    }

    @Before
    public void Setup() throws IOException {
        testContext = InstrumentationRegistry.getInstrumentation().getContext();
        appContext = InstrumentationRegistry.getInstrumentation().getTargetContext();
        assetManager = testContext.getAssets();
        extractAssetsRecursively("test_resources");
        testResourcesPath = new File(appContext.getFilesDir(), "test_resources").getAbsolutePath();
        accessKey = appContext.getString(R.string.pvTestingAccessKey);
    }

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
    public void testInitSuccessDE() throws PicovoiceException {
        File keywordPath = new File(testResourcesPath, "keyword_files/de/ananas_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/de/test_de_android.rhn");
        File porcupineModelPath = new File(testResourcesPath, "porcupine_model_files/porcupine_params_de.pv");
        File rhinoModelPath = new File(testResourcesPath, "rhino_model_files/rhino_params_de.pv");
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
    public void testInitSuccessES() throws PicovoiceException {
        File keywordPath = new File(testResourcesPath, "keyword_files/es/emparedado_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/es/test_es_android.rhn");
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
    public void testInitSuccessFR() throws PicovoiceException {
        File keywordPath = new File(testResourcesPath, "keyword_files/fr/framboise_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/fr/test_fr_android.rhn");
        File porcupineModelPath = new File(testResourcesPath, "porcupine_model_files/porcupine_params_fr.pv");
        File rhinoModelPath = new File(testResourcesPath, "rhino_model_files/rhino_params_fr.pv");
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
        File contextPath = new File(testResourcesPath, "context_files/de/test_de_android.rhn");

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
    public void testProcSuccess() throws Exception {

        File keywordPath = new File(testResourcesPath, "keyword_files/en/picovoice_android.ppn");
        File contextPath = new File(testResourcesPath, "context_files/en/coffee_maker_android.rhn");
        Picovoice p = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setKeywordPath(keywordPath.getAbsolutePath())
                .setContextPath(contextPath.getAbsolutePath())
                .setWakeWordCallback(wakeWordCallback)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        File testAudio = new File(testResourcesPath, "audio_samples/picovoice-coffee.wav");
        FileInputStream audioInputStream = new FileInputStream(testAudio);

        byte[] rawData = new byte[p.getFrameLength() * 2];
        short[] pcm = new short[p.getFrameLength()];
        ByteBuffer pcmBuff = ByteBuffer.wrap(rawData).order(ByteOrder.LITTLE_ENDIAN);

        assertEquals(44, audioInputStream.skip(44));

        while (audioInputStream.available() > 0) {
            int numRead = audioInputStream.read(pcmBuff.array());
            if (numRead == p.getFrameLength() * 2) {
                pcmBuff.asShortBuffer().get(pcm);
                p.process(pcm);
            }
        }

        assertTrue(isWakeWordDetected);
        assertNotNull(inferenceResult);
        assertEquals("orderBeverage", inferenceResult.getIntent());

        Map<String, String> slots = inferenceResult.getSlots();
        assertEquals("large", slots.get("size"));
        assertEquals("coffee", slots.get("beverage"));

        p.delete();
    }

    @Test
    public void testProcSuccessAgain() throws Exception {
        testProcSuccess();
    }

    private void extractAssetsRecursively(String path) throws IOException {

        String[] list = assetManager.list(path);
        if (list.length > 0) {
            File outputFile = new File(appContext.getFilesDir(), path);
            if (!outputFile.exists()) {
                if (!outputFile.mkdirs()) {
                    throw new IOException("Couldn't create output directory " + outputFile.getAbsolutePath());
                }
            }

            for (String file : list) {
                String filepath = path + "/" + file;
                extractAssetsRecursively(filepath);
            }
        } else {
            extractTestFile(path);
        }
    }

    private void extractTestFile(String filepath) throws IOException {

        InputStream is = new BufferedInputStream(assetManager.open(filepath), 256);
        File absPath = new File(appContext.getFilesDir(), filepath);
        OutputStream os = new BufferedOutputStream(new FileOutputStream(absPath), 256);
        int r;
        while ((r = is.read()) != -1) {
            os.write(r);
        }
        os.flush();

        is.close();
        os.close();
    }
}
