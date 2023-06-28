# Voice-Controlled Video Player

## Compatibility

This binding is for running Picovoice on **Unity 2017.4+** on the following platforms:

- Android 5.1+ (API 21+) (ARM only)
- iOS 9.0+
- Windows (x86_64)
- macOS (x86_64)
- Linux (x86_64)

## Installation

If running the project from source, run the `copy.sh` script first to copy resources from elsewhere in the repo. You should then be able to choose one of the supported platforms and build the demo.

## Usage

Open [Assets/Scripts/VideoController.cs](Assets/Scripts/VideoController.cs) and replace `{YOUR_ACCESS_KEY_HERE}` with your access key obtained from from Picovoice Console (https://console.picovoice.ai/).
Press `Build and Run` in Unity Editor to run the demo in the device of your choice.

The wake word for this demo is `Porcupine`. After the wake word, when you see the border light up, you can say a command to control the video player.

**Playback commands:**
- Play (video)
- Pause (video)
- Resume (video)
- Stop (video)
- Mute (video)
- Unmute (video)

**Seek commands:**
- Go to 1 minute 55 seconds
- Skip forward 30 seconds

**Volume commands:**
- set volume to 30%
- 100% volume

**Playback speed commands:**
- set playback speed to 1.5 times
- change playback speed to 25%
- playback speed normal	

While using the app, you can say "Porcupine, show/hide help" to see some examples of what to say.
