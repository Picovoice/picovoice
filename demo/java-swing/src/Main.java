/*
    Copyright 2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

import ai.picovoice.picovoice.Picovoice;
import ai.picovoice.picovoice.PicovoiceInferenceCallback;
import ai.picovoice.picovoice.PicovoiceWakeWordCallback;
import org.apache.commons.cli.*;

import javax.sound.sampled.*;
import javax.swing.*;
import java.awt.*;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.*;

public class Main {

    static final String[] LOCATIONS = {"kitchen", "living room", "bedroom", "hallway", "bathroom", "closet", "pantry"};
    static final Map<String, Color> COLOR_MAP = new HashMap<>() {{
        put("none", new Color(0, 0, 0, 255));
        put("blue", new Color(0, 0, 255, 255));
        put("green", new Color(0, 255, 0, 255));
        put("orange", new Color(255, 128, 0, 255));
        put("pink", new Color(255, 0, 128, 255));
        put("purple", new Color(255, 0, 255, 255));
        put("red", new Color(255, 0, 0, 255));
        put("white", new Color(255, 255, 255, 255));
        put("yellow", new Color(255, 255, 0, 255));
    }};
    static Map<String, JPanel> locationLights = new HashMap<>();

    static final String ENVIRONMENT_NAME;

    static {
        ENVIRONMENT_NAME = getEnvironmentName();
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
            formatter.printHelp("JavaSwingDemo", options);
            System.exit(1);
            return;
        }

        if (cmd.hasOption("help")) {
            formatter.printHelp("JavaSwingDemo", options);
            return;
        }

        String accessKey = cmd.getOptionValue("access_key");

        if (accessKey == null || accessKey.length() == 0) {
            throw new IllegalArgumentException("AccessKey is required.");
        }

        JFrame f = new JFrame();
        f.setSize(575, 300);
        f.setLayout(null);
        f.setVisible(true);

        int locX = 30;
        int locY = 75;

        for (String location :
                LOCATIONS) {
            JLabel label = new JLabel();
            label.setText(location);
            label.setBounds(locX - 20, locY - 43, 80, 50);
            label.setHorizontalTextPosition(SwingConstants.CENTER);
            label.setVerticalTextPosition(SwingConstants.CENTER);
            label.setHorizontalAlignment(SwingConstants.CENTER);
            f.add(label);

            JPanel colorBox = new JPanel();
            colorBox.setBounds(locX, locY, 40, 40);
            colorBox.setBackground(new Color(255, 255, 255));
            f.add(colorBox);
            locationLights.put(location, colorBox);

            locX += 75;
        }

        JLabel infoText = new JLabel();
        infoText.setBounds(30, 160, 500, 30);
        infoText.setText("Say 'Jarvis'!");
        infoText.setFont(new Font("Arial", Font.PLAIN, 12));
        infoText.setHorizontalTextPosition(SwingConstants.CENTER);
        infoText.setVerticalTextPosition(SwingConstants.CENTER);
        infoText.setHorizontalAlignment(SwingConstants.CENTER);
        f.add(infoText);

        JLabel infoText2 = new JLabel();
        infoText2.setBounds(30, 175, 500, 50);
        infoText2.setText("Then you can say a command like - 'Change the kitchen lights to green' or 'Turn on all the lights'");
        infoText2.setFont(new Font("Arial", Font.PLAIN, 11));
        infoText2.setHorizontalTextPosition(SwingConstants.CENTER);
        infoText2.setVerticalTextPosition(SwingConstants.CENTER);
        infoText2.setHorizontalAlignment(SwingConstants.CENTER);
        f.add(infoText2);

        // get audio capture device
        AudioFormat format = new AudioFormat(16000f, 16, 1, true, false);
        DataLine.Info dataLineInfo = new DataLine.Info(TargetDataLine.class, format);
        TargetDataLine micDataLine;
        try {
            micDataLine = (TargetDataLine) AudioSystem.getLine(dataLineInfo);
            micDataLine.open(format);
        } catch (LineUnavailableException e) {
            System.err.println("Failed to get a valid audio capture device.");
            System.exit(1);
            return;
        }

        PicovoiceWakeWordCallback wakeWordCallback = () -> infoText.setText("Listening...");
        PicovoiceInferenceCallback inferenceCallback = inference -> {
            if (inference.getIsUnderstood()) {
                final String intent = inference.getIntent();
                final Map<String, String> slots = inference.getSlots();

                StringBuilder inferenceStr = new StringBuilder(intent);
                for (Map.Entry<String, String> slot : inference.getSlots().entrySet()) {
                    inferenceStr.append(String.format(" {%s : '%s'}", slot.getKey(), slot.getValue()));
                }
                infoText2.setText(inferenceStr.toString());

                Set<String> locationLightsToChange = locationLights.keySet();
                if (slots.containsKey("location")) {
                    String location = slots.get("location");
                    locationLightsToChange = new HashSet<>();
                    locationLightsToChange.add(location);
                }

                switch (intent) {
                    case "changeColor":
                        Color color = COLOR_MAP.get("white");
                        if (slots.containsKey("color")) {
                            color = COLOR_MAP.get(slots.get("color"));
                        }

                        ChangeLightColor(locationLightsToChange, color);
                        break;
                    case "changeLightState":
                        boolean state = false;
                        if (slots.containsKey("state")) {
                            state = slots.get("state").equals("on");
                        }

                        ChangeLightState(locationLightsToChange, state);
                        break;
                    case "changeLightStateOff":
                        ChangeLightState(locationLightsToChange, false);
                        break;
                }

                // update ui
                infoText.setText("Say 'Jarvis'!");
                f.revalidate();
            } else {
                infoText.setText("Say 'Jarvis'!");
                infoText2.setText("Didn't understand the command.");
            }
        };

        Picovoice picovoice;
        final String keywordPath = String.format("res/keyword_files/%s/jarvis_%s.ppn", ENVIRONMENT_NAME, ENVIRONMENT_NAME);
        final String contextPath = String.format("res/contexts/%s/smart_lighting_%s.rhn", ENVIRONMENT_NAME, ENVIRONMENT_NAME);

        try {
            picovoice = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath)
                    .setWakeWordCallback(wakeWordCallback)
                    .setContextPath(contextPath)
                    .setInferenceCallback(inferenceCallback)
                    .build();

            micDataLine.start();

            // buffers for processing audio
            int frameLength = picovoice.getFrameLength();
            ByteBuffer captureBuffer = ByteBuffer.allocate(frameLength * 2);
            captureBuffer.order(ByteOrder.LITTLE_ENDIAN);
            short[] picovoiceBuffer = new short[frameLength];

            int numBytesRead;
            while (System.in.available() == 0) {

                // read a buffer of audio
                numBytesRead = micDataLine.read(captureBuffer.array(), 0, captureBuffer.capacity());

                // don't pass to Picovoice if we don't have a full buffer
                if (numBytesRead != frameLength * 2) {
                    continue;
                }

                // copy into 16-bit buffer
                captureBuffer.asShortBuffer().get(picovoiceBuffer);

                // process with picovoice
                picovoice.process(picovoiceBuffer);
            }
        } catch (Exception e) {
            System.err.println(e.toString());
        }
    }

    private static Options BuildCommandLineOptions() {
        Options options = new Options();

        options.addOption(Option.builder("a")
                .longOpt("access_key")
                .hasArg(true)
                .desc("AccessKey obtained from Picovoice Console (https://picovoice.ai/console/).")
                .build());

        options.addOption(new Option("h", "help", false, ""));

        return options;
    }
    static void ChangeLightColor(Set<String> locations, Color color) {
        for (String location : locations) {
            locationLights.get(location).setBackground(color);
        }
    }

    static void ChangeLightState(Set<String> locations, boolean state) {

        int alpha = state ? 255 : 0;
        for (String location : locations) {
            JPanel light = locationLights.get(location);
            Color c = light.getBackground();
            Color newColor = new Color(c.getRed(), c.getGreen(), c.getBlue(), alpha);
            light.setBackground(newColor);
        }
    }

    static String getEnvironmentName() throws RuntimeException {
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
                System.err.println("Execution environment not supported. " +
                        "Porcupine Java is supported on MacOS, Linux and Windows");
                return null;
            }
        } else {
            System.err.printf("Platform architecture (%s) not supported. " +
                    "Porcupine Java is only supported on amd64 and x86_64 architectures.%n", arch);
            return null;
        }
    }
}  