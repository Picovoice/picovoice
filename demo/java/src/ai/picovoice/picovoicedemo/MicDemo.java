/*
    Copyright 2018-2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.picovoicedemo;

import ai.picovoice.picovoice.Picovoice;
import ai.picovoice.picovoice.PicovoiceInferenceCallback;
import ai.picovoice.picovoice.PicovoiceWakeWordCallback;
import org.apache.commons.cli.*;

import javax.sound.sampled.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Map;

public class MicDemo {
    public static void runDemo(
            String accessKey, String keywordPath, String contextPath,
            String porcupineLibraryPath, String porcupineModelPath, float porcupineSensitivity,
            String rhinoLibraryPath, String rhinoModelPath, float rhinoSensitivity,
            int audioDeviceIndex, String outputPath, boolean requireEndpoint) {

        // for file output
        File outputFile = null;
        ByteArrayOutputStream outputStream = null;
        long totalBytesCaptured = 0;
        AudioFormat format = new AudioFormat(16000f, 16, 1, true, false);

        // get audio capture device
        DataLine.Info dataLineInfo = new DataLine.Info(TargetDataLine.class, format);
        TargetDataLine micDataLine;
        try {
            micDataLine = getAudioDevice(audioDeviceIndex, dataLineInfo);
            micDataLine.open(format);
        } catch (LineUnavailableException e) {
            System.err.println("Failed to get a valid capture device. Use --show_audio_devices to " +
                    "show available capture devices and their indices");
            System.exit(1);
            return;
        }

        PicovoiceWakeWordCallback wakeWordCallback = () -> System.out.println("[wake word]");
        PicovoiceInferenceCallback inferenceCallback = inference -> {
            if (inference.getIsUnderstood()) {

                System.out.println("{");
                System.out.println(String.format("  intent : '%s'", inference.getIntent()));
                System.out.println("  slots : {");
                for (Map.Entry<String, String> slot : inference.getSlots().entrySet()) {
                    System.out.println(String.format("    %s : '%s'", slot.getKey(), slot.getValue()));
                }
                System.out.println("  }");
                System.out.println("}");
            } else {
                System.out.println("Didn't understand the command.");
            }
        };

        Picovoice picovoice = null;
        try {
            picovoice = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath)
                    .setWakeWordCallback(wakeWordCallback)
                    .setContextPath(contextPath)
                    .setInferenceCallback(inferenceCallback)
                    .setPorcupineLibraryPath(porcupineLibraryPath)
                    .setPorcupineModelPath(porcupineModelPath)
                    .setPorcupineSensitivity(porcupineSensitivity)
                    .setRhinoLibraryPath(rhinoLibraryPath)
                    .setRhinoModelPath(rhinoModelPath)
                    .setRhinoSensitivity(rhinoSensitivity)
                    .setRequireEndpoint(requireEndpoint)
                    .build();

            if (outputPath != null) {
                outputFile = new File(outputPath);
                outputStream = new ByteArrayOutputStream();
            }

            micDataLine.start();

            System.out.println("Press enter to stop recording.");
            System.out.println("Listening...");

            // buffers for processing audio
            int frameLength = picovoice.getFrameLength();
            ByteBuffer captureBuffer = ByteBuffer.allocate(frameLength * 2);
            captureBuffer.order(ByteOrder.LITTLE_ENDIAN);
            short[] picovoiceBuffer = new short[frameLength];

            int numBytesRead;
            while (System.in.available() == 0) {

                // read a buffer of audio
                numBytesRead = micDataLine.read(captureBuffer.array(), 0, captureBuffer.capacity());
                totalBytesCaptured += numBytesRead;

                // write to output if we're recording
                if (outputStream != null) {
                    outputStream.write(captureBuffer.array(), 0, numBytesRead);
                }

                // don't pass to Picovoice if we don't have a full buffer
                if (numBytesRead != frameLength * 2) {
                    continue;
                }

                // copy into 16-bit buffer
                captureBuffer.asShortBuffer().get(picovoiceBuffer);

                // process with picovoice
                picovoice.process(picovoiceBuffer);
            }
            System.out.println("Stopping...");
        } catch (Exception e) {
            System.err.println(e.toString());
        } finally {
            if (outputFile != null && outputStream != null) {

                // need to transfer to input stream to write
                ByteArrayInputStream writeArray = new ByteArrayInputStream(outputStream.toByteArray());
                AudioInputStream writeStream = new AudioInputStream(writeArray, format, totalBytesCaptured / format.getFrameSize());

                try {
                    AudioSystem.write(writeStream, AudioFileFormat.Type.WAVE, outputFile);
                } catch (IOException e) {
                    System.err.printf("Failed to write audio to '%s'.\n", outputFile.getPath());
                    e.printStackTrace();
                }
            }

            if (picovoice != null) {
                picovoice.delete();
            }
        }
    }

    private static void showAudioDevices() {

        // get available audio devices
        Mixer.Info[] allMixerInfo = AudioSystem.getMixerInfo();
        Line.Info captureLine = new Line.Info(TargetDataLine.class);

        for (int i = 0; i < allMixerInfo.length; i++) {

            // check if supports capture in the format we need
            Mixer mixer = AudioSystem.getMixer(allMixerInfo[i]);
            if (mixer.isLineSupported(captureLine)) {
                System.out.printf("Device %d: %s\n", i, allMixerInfo[i].getName());
            }
        }
    }

    private static TargetDataLine getDefaultCaptureDevice(DataLine.Info dataLineInfo) throws LineUnavailableException {

        if (!AudioSystem.isLineSupported(dataLineInfo)) {
            throw new LineUnavailableException("Default capture device does not support the audio " +
                    "format required by Picovoice (16kHz, 16-bit, linearly-encoded, single-channel PCM).");
        }

        return (TargetDataLine) AudioSystem.getLine(dataLineInfo);
    }

    private static TargetDataLine getAudioDevice(int deviceIndex, DataLine.Info dataLineInfo) throws LineUnavailableException {

        if (deviceIndex >= 0) {
            try {
                Mixer.Info mixerInfo = AudioSystem.getMixerInfo()[deviceIndex];
                Mixer mixer = AudioSystem.getMixer(mixerInfo);

                if (mixer.isLineSupported(dataLineInfo)) {
                    return (TargetDataLine) mixer.getLine(dataLineInfo);
                } else {
                    System.err.printf("Audio capture device at index %s does not support the audio format required by " +
                            "Picovoice. Using default capture device.", deviceIndex);
                }
            } catch (Exception e) {
                System.err.printf("No capture device found at index %s. Using default capture device.", deviceIndex);
            }
        }

        // use default capture device if we couldn't get the one requested
        return getDefaultCaptureDevice(dataLineInfo);
    }

    public static void main(String[] args) {

        Options options = BuildCommandLineOptions();
        CommandLineParser parser = new DefaultParser();
        HelpFormatter formatter = new HelpFormatter();

        CommandLine cmd;
        try {
            cmd = parser.parse(options, args);
        } catch (ParseException e) {
            System.out.println(e.getMessage());
            formatter.printHelp("picovoicemicdemo", options);
            System.exit(1);
            return;
        }

        if (cmd.hasOption("help")) {
            formatter.printHelp("picovoicemicdemo", options);
            return;
        }

        if (cmd.hasOption("show_audio_devices")) {
            showAudioDevices();
            return;
        }

        String accessKey = cmd.getOptionValue("access_key");
        String keywordPath = cmd.getOptionValue("keyword_path");
        String contextPath = cmd.getOptionValue("context_path");
        String porcupineLibraryPath = cmd.getOptionValue("porcupine_library_path");
        String porcupineModelPath = cmd.getOptionValue("porcupine_model_path");
        String porcupineSensitivityStr = cmd.getOptionValue("porcupine_sensitivity");
        String rhinoLibraryPath = cmd.getOptionValue("rhino_library_path");
        String rhinoModelPath = cmd.getOptionValue("rhino_model_path");
        String rhinoSensitivityStr = cmd.getOptionValue("rhino_sensitivity");
        String audioDeviceIndexStr = cmd.getOptionValue("audio_device_index");
        String outputPath = cmd.getOptionValue("output_path");
        boolean requireEndpoint = cmd.hasOption("require_endpoint");

        if (accessKey == null || accessKey.length() == 0) {
            throw new IllegalArgumentException("AccessKey is required for Porcupine.");
        }

        // parse sensitivity
        float porcupineSensitivity = 0.5f;
        if (porcupineSensitivityStr != null) {
            try {
                porcupineSensitivity = Float.parseFloat(porcupineSensitivityStr);
            } catch (Exception e) {
                throw new IllegalArgumentException("Failed to parse Porcupine sensitivity value. " +
                        "Must be a floating-point number between [0,1].");
            }
            if (porcupineSensitivity < 0 || porcupineSensitivity > 1) {
                throw new IllegalArgumentException(String.format("Failed to parse Porcupine  sensitivity value (%s). " +
                        "Must be a floating-point number between [0,1].", porcupineSensitivity));
            }
        }

        float rhinoSensitivity = 0.5f;
        if (rhinoSensitivityStr != null) {
            try {
                rhinoSensitivity = Float.parseFloat(rhinoSensitivityStr);
            } catch (Exception e) {
                throw new IllegalArgumentException("Failed to parse Rhino sensitivity value. " +
                        "Must be a floating-point number between [0,1].");
            }
            if (rhinoSensitivity < 0 || rhinoSensitivity > 1) {
                throw new IllegalArgumentException(String.format("Failed to parse Rhino sensitivity value (%s). " +
                        "Must be a floating-point number between [0,1].", rhinoSensitivity));
            }
        }

        if (keywordPath == null) {
            throw new IllegalArgumentException("No keyword file provided. This is a required argument.");
        }
        File keywordFile = new File(keywordPath);
        if (!keywordFile.exists()) {
            throw new IllegalArgumentException(String.format("Keyword file at path %s does not exits.", keywordPath));
        }

        if (contextPath == null) {
            throw new IllegalArgumentException("No context file provided. This is a required argument.");
        }
        File contextFile = new File(contextPath);
        if (!contextFile.exists()) {
            throw new IllegalArgumentException(String.format("Context file at path '%s' does not exist", contextPath));
        }

        int audioDeviceIndex = -1;
        if (audioDeviceIndexStr != null) {
            try {
                audioDeviceIndex = Integer.parseInt(audioDeviceIndexStr);
                if (audioDeviceIndex < 0) {
                    throw new IllegalArgumentException(String.format("Audio device index %s is not a " +
                            "valid positive integer.", audioDeviceIndexStr));
                }
            } catch (Exception e) {
                throw new IllegalArgumentException(String.format("Audio device index '%s' is not a " +
                        "valid positive integer.", audioDeviceIndexStr));
            }
        }

        runDemo(accessKey, keywordPath, contextPath,
                porcupineLibraryPath, porcupineModelPath, porcupineSensitivity,
                rhinoLibraryPath, rhinoModelPath, rhinoSensitivity,
                audioDeviceIndex, outputPath, requireEndpoint);
    }

    private static Options BuildCommandLineOptions() {
        Options options = new Options();

        options.addOption(Option.builder("a")
                .longOpt("access_key")
                .hasArg(true)
                .desc("AccessKey obtained from Picovoice Console (https://picovoice.ai/console/).")
                .build());

        options.addOption(Option.builder("k")
                .longOpt("keyword_path")
                .hasArg(true)
                .desc("Absolute path to a Porcupine keyword file.")
                .build());

        options.addOption(Option.builder("c")
                .longOpt("context_path")
                .hasArg(true)
                .desc("Absolute path to a Rhino context file.")
                .build());

        options.addOption(Option.builder("pl")
                .longOpt("porcupine_library_path")
                .hasArg(true)
                .desc("Absolute path to the Porcupine native runtime library.")
                .build());

        options.addOption(Option.builder("pm")
                .longOpt("porcupine_model_path")
                .hasArg(true)
                .desc("Absolute path to Porcupine's model file.")
                .build());

        options.addOption(Option.builder("ps")
                .longOpt("porcupine_sensitivity")
                .hasArgs()
                .desc("Sensitivity for detecting wake word. Each value should be a number within [0, 1]. A higher " +
                        "sensitivity results in fewer misses at the cost of increasing the false alarm rate.")
                .build());

        options.addOption(Option.builder("rl")
                .longOpt("rhino_library_path")
                .hasArg(true)
                .desc("Absolute path to the Rhino native runtime library.")
                .build());

        options.addOption(Option.builder("rm")
                .longOpt("rhino_model_path")
                .hasArg(true)
                .desc("Absolute path to Rhino's model file.")
                .build());

        options.addOption(Option.builder("rs")
                .longOpt("rhino_sensitivity")
                .hasArgs()
                .desc("Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value " +
                        "results in fewer misses at the cost of (potentially) increasing the erroneous inference rate.")
                .build());

        options.addOption(new Option("e", "require_endpoint", false, "If set, Rhino requires an endpoint " +
                "(chunk of silence) before finishing inference."));

        options.addOption(Option.builder("o")
                .longOpt("output_path")
                .hasArg(true)
                .desc("Absolute path to recorded audio for debugging.")
                .build());

        options.addOption(Option.builder("di")
                .longOpt("audio_device_index")
                .hasArg(true)
                .desc("Index of input audio device.")
                .build());

        options.addOption(new Option("sd", "show_audio_devices", false, "Print available recording devices."));
        options.addOption(new Option("h", "help", false, ""));

        return options;
    }
}
