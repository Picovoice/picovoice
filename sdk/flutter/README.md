# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

This binding is for running Picovoice on **Flutter 1.20.0+** on the following platforms:

- Android 4.1+ (API 16+)
- iOS 9.0+

## Installation

To start, you must have the [Flutter SDK](https://flutter.dev/docs/get-started/install) installed on your system. Once installed, you can run `flutter doctor` to determine any other missing requirements. 

To add the Picovoice package to your app project, you can reference it in your pub.yaml:
```yaml
dependencies:  
  picovoice: ^<version>
```

If you prefer to clone the repo and use it locally, you can reference the local binding location:
```yaml
dependencies:  
  picovoice:
    path: /path/to/picovoice/flutter/binding
```

**NOTE:** When archiving for release on iOS, you may have to change the build settings of your project in order to prevent stripping of the Picovoice library. To do this open the Runner project in XCode and change build setting Deployment -> Strip Style to 'Non-Global Symbols'.

## Permissions

To enable recording with the hardware's microphone, you must first ensure that you have enabled the proper permission on both iOS and Android.

On iOS, open your Info.plist and add the following line:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>[Permission explanation]</string>
```

On Android, open your AndroidManifest.xml and add the following line:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## Usage

The module provides you with two levels of API to choose from depending on your needs.

#### High-Level API

[PicovoiceManager](/sdk/flutter/lib/picovoice_manager.dart) provides a high-level API that takes care of audio recording. This class is the quickest way to get started.

The constructor `PicovoiceManager.create` will create an instance of the PicovoiceManager using the Porcupine keyword and Rhino context files that you pass to it.
```dart
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';

void createPicovoiceManager() async {
    try{
        _picovoiceManager = await PicovoiceManager.create(
            "/path/to/keyword/file.ppn",
            _wakeWordCallback,
            "/path/to/context/file.rhn",
            _inferenceCallback);
    } on PvError catch (err) {
        // handle picovoice init error
    }
}
```
NOTE: the call is asynchronous and therefore should be called in an async block with a try/catch.

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

```dart
void _wakeWordCallback(int keywordIndex){
    if(keywordIndex == 0){
        // wake word detected
    }
}

void _infererenceCallback(Map<String, dynamic> inference){
    if(inference['isUnderstood']){
        String intent = inference['intent']
        Map<String, String> slots = inference['slots']
        // add code to take action based on inferred intent and slot values
    }
    else{
        // add code to handle unsupported commands
    }    
}
```

You can override the default model files and sensitivities. There is also an optional errorCallback that is called if there is a problem encountered while processing audio. These optional parameters can be passed in like so:
```dart
void createPicovoiceManager() async {
    double porcupineSensitivity = 0.7;
    double rhinoSensitivity = 0.6;
    try{
        _picovoiceManager = await PicovoiceManager.create(
            "/path/to/keyword/file.ppn",
            wakeWordCallback,
            "/path/to/context/file.rhn",
            inferenceCallback,
            porcupineSensitivity: porcupineSensitivity,
            rhinoSensitivity: rhinoSensitivity,
            porcupineModelPath: "/path/to/porcupine/model.pv",
            rhinoModelPath: "/path/to/rhino/model.pv",
            errorCallback: _errorCallback);
    } on PvError catch (err) {
        // handle picovoice init error
    }
}

void _errorCallback(PvError error){
    // handle error
}
```

Once you have instantiated a PicovoiceManager, you can start audio capture and processing by calling:

```dart
try{
    await _picovoiceManager.start();
} on PvAudioException catch (ex) {
    // deal with audio exception     
}
```

And then stop it by calling:

```dart
await _picovoiceManager.stop();
```

Once the app is done with using an instance of PicovoiceManager, be sure you explicitly release the resources allocated to Picovoice:
```dart
await _picovoiceManager.delete();
```

PicovoiceManager uses our
[flutter_voice_processor](https://github.com/Picovoice/flutter-voice-processor/)
Flutter plugin to capture frames of audio and automatically pass it to the Picovoice platform.

#### Low-Level API

[Picovoice](/sdk/flutter/lib/picovoice.dart) provides low-level access to the Picovoice platform for those
who want to incorporate it into a already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file and Rhino context file to the `create` static constructor. Sensitivity and model files are optional.

```dart
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';

void createPicovoice() async {
    double porcupineSensitivity = 0.7;
    double rhinoSensitivity = 0.6;
    try{
        _picovoice = await Picovoice.create(
            "/path/to/keyword/file.ppn",
            wakeWordCallback,
            "/path/to/context/file.rhn",
            inferenceCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine/model.pv",
            "/path/to/rhino/model.pv");
    } on PvError catch (err) {
        // handle picovoice init error
    }
}

void wakeWordCallback(int keywordIndex){
    if(keywordIndex == 0){
        // wake word detected
    }
}

void infererenceCallback(Map<String, dynamic> inference){
    if(inference['isUnderstood']){
        String intent = inference['intent']
        Map<String, String> slots = inference['slots']
        // add code to take action based on inferred intent and slot values
    }
    else{
        // add code to handle unsupported commands
    }    
}
```

To use Picovoice, you must pass frames of audio to the `process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```dart
List<int> buffer = getAudioFrame();

try {
    _picovoice.process(buffer);
} on PvError catch (error) {
    // handle error
}
```

For process to work correctly, the audio data must be in the audio format required by Picovoice.
The required audio format is found by calling `.sampleRate` to get the required sample rate and `.frameLength` to get the required frame size. Audio must be single-channel and 16-bit linearly-encoded.

Finally, once you no longer need the Picovoice, be sure to explicitly release the resources allocated to it:

```dart
_picovoice.delete();
```

## Demo App

Check out the [Picovoice Flutter demo](/demo/flutter) to see what it looks like to use Picovoice in a cross-platform app!
