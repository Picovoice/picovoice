package ai.picovoice.picovoice.testapp;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.junit.Test;
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

@RunWith(Parameterized.class)
public class LanguageTests extends BaseTest {

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

        picovoice = new Picovoice.Builder()
                .setAccessKey(accessKey)
                .setPorcupineModelPath(porcupineModelPath)
                .setRhinoModelPath(rhinoModelPath)
                .setKeywordPath(keywordPath)
                .setContextPath(contextPath)
                .setWakeWordCallback(wakeWordCallback)
                .setInferenceCallback(inferenceCallback)
                .build(appContext);

        File testAudio = new File(testResourcesPath, testAudioFile);

        processTestAudio(picovoice, testAudio);
        Thread.sleep(500);

        assertTrue(isWakeWordDetected);
        assertNotNull(inferenceResult);
        assertTrue(inferenceResult.getIsUnderstood());
        assertEquals(expectedIntent, inferenceResult.getIntent());
        assertEquals(expectedSlots, inferenceResult.getSlots());

        isWakeWordDetected = false;
        inferenceResult = null;

        // test again
        processTestAudio(picovoice, testAudio);
        Thread.sleep(500);

        assertTrue(isWakeWordDetected);
        assertNotNull(inferenceResult);
        assertTrue(inferenceResult.getIsUnderstood());
        assertEquals(expectedIntent, inferenceResult.getIntent());
        assertEquals(expectedSlots, inferenceResult.getSlots());
    }
}
