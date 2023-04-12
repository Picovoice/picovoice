# Picovoice SDK for Flutter

## Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device.

Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

This binding is for running Picovoice on **Flutter 2.8.1+** on the following platforms:

- Android 5.0+ (API 21+)
- iOS 11.0+

## Installation

To start, you must have the [Flutter SDK](https://flutter.dev/docs/get-started/install) installed on your system. Once installed, you can run `flutter doctor` to determine any other missing requirements.

To add the Picovoice package to your app project, you can reference it in your pub.yaml:
```yaml
dependencies:
  picovoice_flutter: ^<version>
```

If you prefer to clone the repo and use it locally, you can reference the local binding location:
```yaml
dependencies:
  picovoice:
    path: /path/to/picovoice/flutter/binding
```

**NOTE:** When archiving for release on iOS, you may have to change the build settings of your project in order to prevent stripping of the Picovoice library. To do this open the Runner project in XCode and change build setting Deployment -> Strip Style to 'Non-Global Symbols'.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

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
<uses-permission android:name="android.permission.INTERNET" />
```

## Usage

The module provides you with two levels of API to choose from depending on your needs.

#### High-Level API

[PicovoiceManager](https://picovoice.ai/docs/api/picovoice-flutter/#picovoicemanager) provides a high-level API that takes care of audio recording. This class is the quickest way to get started.

The constructor `PicovoiceManager.create` will create an instance of the PicovoiceManager using the Porcupine keyword and Rhino context files that you pass to it.
```dart
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';

final String accessKey = "{ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

_picovoiceManager = PicovoiceManager.create(
    accessKey,
    "/path/to/keyword/file.ppn",
    _wakeWordCallback,
    "/path/to/context/file.rhn",
    _inferenceCallback);
```

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

The `inferenceCallback` callback function takes a parameter of `RhinoInference` instance with the following variables:
- isUnderstood - true if Rhino understood what it heard based on the context or false if Rhino did not understand context
- intent - **null** if `isUnderstood` is not true, otherwise name of intent that were inferred
- slots - **null** if `isUnderstood` is not true, otherwise the dictionary of slot keys and values that were inferred

```dart
void _wakeWordCallback(){
    // wake word detected
}

void _inferenceCallback(RhinoInference inference) {
    if(inference.isUnderstood!) {
        String intent = inference.intent!;
        Map<String, String> slots = inference.slots!;
        // add code to take action based on inferred intent and slot values
    }
    else {
        // add code to handle unsupported commands
    }
}
```

Picovoice accepts the following optional parameters:
- `porcupineSensitivity`: overrides the default wake word sensitivity.
- `rhinoSensitivity`: overrides the default inference sensitivity.
- `processErrorCallback`: called if there is a problem encountered while processing audio.
- `endpointDurationSec`: sets how much silence is required after a spoken command.
- `requireEndpoint`: indicates whether Rhino should wait for silence before returning an inference.

 These optional parameters can be passed in like so:

```dart
final String accessKey = "{ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

void createPicovoiceManager() {
    double porcupineSensitivity = 0.7;
    double rhinoSensitivity = 0.6;
    _picovoiceManager = PicovoiceManager.create(
        accessKey,
        "/path/to/keyword/file.ppn",
        wakeWordCallback,
        "/path/to/context/file.rhn",
        inferenceCallback,
        porcupineSensitivity: porcupineSensitivity,
        rhinoSensitivity: rhinoSensitivity,
        porcupineModelPath: "/path/to/porcupine/model.pv",
        rhinoModelPath: "/path/to/rhino/model.pv",
        endpointDurationSec: 1.5,
        requireEndpoint: false,
        errorCallback: _errorCallback);
}

void _errorCallback(PicovoiceException error) {
    // handle error
}
```

Once you have instantiated a PicovoiceManager, you can start audio capture and processing by calling:

```dart
try {
    await _picovoiceManager.start();
} on PicovoiceException catch(ex) {
    // deal with Picovoice init error
}
```

And then stop it by calling:

```dart
await _picovoiceManager.stop();
```

PicovoiceManager uses our
[flutter_voice_processor](https://github.com/Picovoice/flutter-voice-processor/)
Flutter plugin to capture frames of audio and automatically pass it to the Picovoice platform.

#### Low-Level API

[Picovoice](https://picovoice.ai/docs/api/picovoice-flutter/#picovoice) provides low-level access to the Picovoice platform for those
who want to incorporate it into an already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file and Rhino context file to the `create` static constructor. Sensitivity, model files, `endpointDurationSec`, and `requireEndpoint` are optional.

```dart
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';

final String accessKey = "{ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

void createPicovoice() async {
    double porcupineSensitivity = 0.7;
    double rhinoSensitivity = 0.6;
    double endpointDurationSec = 1.5;
    bool requireEndpoint = false;

    try{
        _picovoice = await Picovoice.create(
            accessKey,
            "/path/to/keyword/file.ppn",
            wakeWordCallback,
            "/path/to/context/file.rhn",
            inferenceCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine/model.pv",
            "/path/to/rhino/model.pv",
            endpointDurationSec
            requireEndpoint);
    } on PicovoiceException catch (err) {
        // handle picovoice init error
    }
}

void wakeWordCallback() {
    // wake word detected
}

void inferenceCallback(RhinoInference inference) {
    if(inference.isUnderstood!) {
        String intent = inference.intent!;
        Map<String, String> slots = inference.slots!;
        // add code to take action based on inferred intent and slot values
    }
    else {
        // add code to handle unsupported commands
    }
}
```

To use Picovoice, you must pass frames of audio to the `process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```dart
List<int> buffer = getAudioFrame();

try {
    _picovoice.process(buffer);
} on PicovoiceException catch (error) {
    // handle error
}
```

For process to work correctly, the audio data must be in the audio format required by Picovoice.
The required audio format is found by calling `.sampleRate` to get the required sample rate and `.frameLength` to get the required frame size. Audio must be single-channel and 16-bit linearly-encoded.

Finally, once you no longer need the Picovoice, be sure to explicitly release the resources allocated to it:

```dart
_picovoice.delete();
```

## Custom Model Integration

To add custom models to your Flutter application, first add them to an `assets` folder in your project directory. Then add them to you your pubspec.yaml:
```yaml
flutter:
  assets:
    - assets/keyword.ppn
    - assets/context.rhn
```

In your Flutter app code, you can then pass the assets directly to Picovoice's `create` constructor:
```dart
String keywordAsset = "assets/keyword.ppn";
String contextAsset = "assets/context.rhn";

final String accessKey = "{ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

try {
    _picovoice = await Picovoice.create(
        accessKey,
        keywordAsset,
        wakeWordCallback,
        contextAsset,
        inferenceCallback);
} on PicovoiceException catch (err) {
    // handle picovoice init error
}
```

Alternatively, if the custom models are deployed to the device with a different method, the absolute paths to the files on device can be used.

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demo App

Check out the [Picovoice Flutter demo](https://github.com/Picovoice/picovoice/tree/master/demo/flutter) to see what it looks like to use Picovoice in a cross-platform app!
