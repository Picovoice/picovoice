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

import javax.sound.sampled.AudioFormat;
import javax.sound.sampled.AudioInputStream;
import javax.sound.sampled.AudioSystem;
import javax.sound.sampled.UnsupportedAudioFileException;
import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.Map;

public class FileDemo {

    public static void runDemo(
            String accessKey, File inputAudioFile, String keywordPath, String contextPath,
            String porcupineLibraryPath, String porcupineModelPath, float porcupineSensitivity,
            String rhinoLibraryPath, String rhinoModelPath, float rhinoSensitivity, boolean requireEndpoint) {

        AudioInputStream audioInputStream;
        try {
            audioInputStream = AudioSystem.getAudioInputStream(inputAudioFile);
        } catch (UnsupportedAudioFileException e) {
            System.err.println("Audio format not supported. Please provide an input file of .au, .aiff or .wav format");
            return;
        } catch (IOException e) {
            System.err.println("Could not find input audio file at " + inputAudioFile);
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

            AudioFormat audioFormat = audioInputStream.getFormat();

            if (audioFormat.getSampleRate() != (float) picovoice.getSampleRate() || audioFormat.getSampleSizeInBits() != 16) {
                throw new IllegalArgumentException(String.format("Invalid input audio file format. " +
                        "Input file must be a %dkHz, 16-bit audio file.", picovoice.getSampleRate()));
            }

            if (audioFormat.getChannels() > 1) {
                System.out.println("Picovoice processes single-channel audio, but a multi-channel file was provided. " +
                        "Processing leftmost channel only.");
            }

            int frameIndex = 0;
            short[] picovoiceFrame = new short[picovoice.getFrameLength()];

            ByteBuffer sampleBuffer = ByteBuffer.allocate(audioFormat.getFrameSize());
            sampleBuffer.order(ByteOrder.LITTLE_ENDIAN);
            while (audioInputStream.available() != 0) {

                int numBytesRead = audioInputStream.read(sampleBuffer.array());
                if (numBytesRead < 2) {
                    break;
                }

                picovoiceFrame[frameIndex++] = sampleBuffer.getShort(0);

                if (frameIndex == picovoiceFrame.length) {

                    picovoice.process(picovoiceFrame);
                    frameIndex = 0;
                }
            }
        } catch (Exception e) {
            System.err.println(e.toString());
        } finally {
            if (picovoice != null) {
                picovoice.delete();
                picovoice = null;
            }
        }
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
            formatter.printHelp("picovoicefiledemo", options);
            System.exit(1);
            return;
        }

        if (cmd.hasOption("help")) {
            formatter.printHelp("picovoicefiledemo", options);
            return;
        }

        String accessKey = cmd.getOptionValue("access_key");
        String inputAudioPath = cmd.getOptionValue("input_audio_path");
        String keywordPath = cmd.getOptionValue("keyword_path");
        String contextPath = cmd.getOptionValue("context_path");
        String porcupineLibraryPath = cmd.getOptionValue("porcupine_library_path");
        String porcupineModelPath = cmd.getOptionValue("porcupine_model_path");
        String porcupineSensitivityStr = cmd.getOptionValue("porcupine_sensitivity");
        String rhinoLibraryPath = cmd.getOptionValue("rhino_library_path");
        String rhinoModelPath = cmd.getOptionValue("rhino_model_path");
        String rhinoSensitivityStr = cmd.getOptionValue("rhino_sensitivity");
        String requireEndpointValue = cmd.getOptionValue("require_endpoint");

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

        if (inputAudioPath == null) {
            throw new IllegalArgumentException("No input audio file provided. This is a required argument.");
        }
        File inputAudioFile = new File(inputAudioPath);
        if (!inputAudioFile.exists()) {
            throw new IllegalArgumentException(String.format("Audio file at path %s does not exits.", inputAudioPath));
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

        boolean requireEndpoint = true;
        if (requireEndpointValue != null && requireEndpointValue.toLowerCase().equals("false")) {
            requireEndpoint = false;
        }

        runDemo(accessKey, inputAudioFile, keywordPath, contextPath,
                porcupineLibraryPath, porcupineModelPath, porcupineSensitivity,
                rhinoLibraryPath, rhinoModelPath, rhinoSensitivity, requireEndpoint);
    }

    private static Options BuildCommandLineOptions() {
        Options options = new Options();

        options.addOption(Option.builder("a")
                .longOpt("access_key")
                .hasArg(true)
                .desc("AccessKey obtained from Picovoice Console (https://picovoice.ai/console/).")
                .build());

        options.addOption(Option.builder("i")
                .longOpt("input_audio_path")
                .hasArg(true)
                .desc("Absolute path to input audio file.")
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

        options.addOption(Option.builder("e")
                .longOpt("require_endpoint")
                .hasArg(true)
                .desc("If set to `false`, Rhino does not require an endpoint (chunk of silence) before " +
                        "finishing inference.")
                .build());

        options.addOption(new Option("h", "help", false, ""));

        return options;
    }
}
