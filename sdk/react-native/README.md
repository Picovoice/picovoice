# Picovoice SDK for React Native

## Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

This binding is for running Picovoice on **React Native 0.62.2+** on the following platforms:

- Android 5.0+ (API 21+)
- iOS 11.0+

## Installation

To start installation be sure you have installed yarn and cocoapods. Then add these native modules to your React Native project.

```console
yarn add @picovoice/react-native-voice-processor
yarn add @picovoice/porcupine-react-native
yarn add @picovoice/rhino-react-native
yarn add @picovoice/picovoice-react-native
```
or
```console
npm i @picovoice/react-native-voice-processor
npm i @picovoice/porcupine-react-native
npm i @picovoice/rhino-react-native
npm i @picovoice/picovoice-react-native
```

Link the iOS packages:

```console
cd ios && pod install && cd ..
```

**NOTE**: Due to a limitation in React Native CLI auto-linking, these native modules cannot be included as transitive dependencies. If you are creating a module that depends on these packages you will have to list these as peer dependencies and require developers to install them alongside.

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

Finally, in your app JS code, be sure to check for user permission consent before proceeding with audio capture:
```javascript
let recordAudioRequest;
if (Platform.OS == 'android') {
    // For Android, we need to explicitly ask
    recordAudioRequest = this._requestRecordAudioPermission();
} else {
    // iOS automatically asks for permission
    recordAudioRequest = new Promise(function (resolve, _) {
    resolve(true);
    });
}

recordAudioRequest.then((hasPermission) => {
    if(hasPermission){
        // Code that uses Picovoice
    }
});

async _requestRecordAudioPermission() {
    const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    {
        title: 'Microphone Permission',
        message: '[Permission explanation]',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
    }
    );
    return (granted === PermissionsAndroid.RESULTS.GRANTED)
  }
```

## Usage

The module provides you with two levels of API to choose from depending on your needs.

#### High-Level API

[PicovoiceManager](https://github.com/Picovoice/picovoice/blob/master/sdk/react-native/src/picovoice_manager.tsx) provides a high-level API that takes care of
audio recording. This class is the quickest way to get started.

The static constructor `PicovoiceManager.create` will create an instance of a PicovoiceManager using a Porcupine keyword file and Rhino context file that you pass to it.
```javascript
const accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

this._picovoiceManager = PicovoiceManager.create(
    accessKey
    '/path/to/keyword.ppn',
    wakeWordCallback,
    '/path/to/context.rhn',
    inferenceCallback);
```

To use wake word (`.ppn`) and context (`.rhn`) files in your React Native application you'll need to add the files to your platform projects. Android models must be added to `./android/app/src/main/assets/`, while iOS models can be added anywhere under `./ios`, but must be included as a bundled resource in your iOS (i.e. add via XCode) project. The paths used as initialization arguments are relative to these device-specific directories.

Alternatively, if the files are deployed to the device with a different method, the absolute paths to the files on device can be used.

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

```javascript
wakeWordCallback() {
    // wake word detected!
}

inferenceCallback(inference) {
    if (inference.isUnderstood) {
        // do something with:
        // inference.intent - string representing intent
        // inference.slots - Object<string, string> representing the slot values
    }
}
```

Picovoice accepts the following optional parameters:
- `porcupineModelPath`: path to file containing model parameters for the wake word engine
- `porcupineSensitivity`: overrides the default wake word sensitivity
- `rhinoModelPath`: path to file containing model parameters for the speech-to-intent engine
- `rhinoSensitivity`: overrides the default inference sensitivity
- `processErrorCallback`: called if there is a problem encountered while processing audio
- `endpointDurationSec`: sets how much silence is required after a spoken command
- `requireEndpoint`: indicates whether Rhino should wait for silence before returning an inference

```javascript
const accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

this._picovoiceManager = PicovoiceManager.create(
            accessKey,
            '/path/to/keyword.ppn',
            wakeWordCallback,
            '/path/to/context.rhn',
            inferenceCallback,
            processErrorCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine_model.pv",
            "/path/to/rhino_model.pv",
            endpointDurationSec,
            requireEndpoint);
```

Once you have instantiated a PicovoiceManager, you can start audio capture and processing by calling:

```javascript
try {
    let didStart = await this._picovoiceManager.start();
} catch (e) { }
```

And then stop it by calling:

```javascript
let didStop = await this._picovoiceManager.stop();
```

With `PicovoiceManager`, the
[@picovoice/react-native-voice-processor](https://github.com/Picovoice/react-native-voice-processor/)
module handles audio capture and automatically passes it to the inference engine.

#### Low-Level API

[Picovoice](https://github.com/Picovoice/picovoice/blob/master/sdk/react-native/src/picovoice.tsx) provides low-level access to the Picovoice platform for those
who want to incorporate it into an already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file (`.ppn`) and Rhino context file (`.rhn`) to the `create` static constructor. Sensitivity, model files, `endpointDurationSec` and `requireEndpoint` are optional.

```javascript
const accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

async createPicovoice() {
    let porcupineSensitivity = 0.7
    let rhinoSensitivity = 0.6
    let endpointDurationSec = 1.5
    let requireEndpoint = false

    try{
        this._picovoice = await Picovoice.create(
            accessKey,
            '/path/to/keyword/file.ppn',
            wakeWordCallback,
            '/path/to/context/file.rhn',
            inferenceCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine/model.pv",
            "/path/to/rhino/model.pv",
          endpointDurationSec,
            false)
    } catch (err) {
        // handle error
    }
}

wakeWordCallback() {
    // wake word detected!
}

inferenceCallback(inference) {
    if (inference.isUnderstood) {
        // do something with:
        // inference.intent - string representing intent
        // inference.slots - Object<string, string> representing the slot values
    }
}
```

To use Picovoice, just pass frames of audio to the `process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```javascript
let buffer = getAudioFrame();

try {
    await this._picovoice.process(buffer);
} catch (e) {
    // handle error
}
```

For `process` to work correctly, the audio data must be in the audio format required by Picovoice.
The required audio format is found by calling `.sampleRate` to get the required sample rate and `.frameLength` to get the required frame size. Audio must be single-channel and 16-bit linearly-encoded.

Finally, once you no longer need the Picovoice, be sure to explicitly release the resources allocated to it:

```javascript
this._picovoice.delete();
```

## Custom Wake Word & Context Integration

To add custom wake words and contexts to your React Native application you'll need to add the model files to your platform projects.

### Adding Android Models

Android models must be added to `./android/app/src/main/assets/`.

### Adding iOS Models

iOS models can be added anywhere under `./ios`, but it must be included as a bundled resource.
The easiest way to include a bundled resource in the iOS project is to:

1. Open XCode.
2. Either:
  - Drag and Drop the model/keyword file to the navigation tab.
  - Right-click on the navigation tab, and click `Add Files To ...`.

This will bundle your models together when the app is built.

### Using Custom Models

Pass the file paths (relative to the assets/resource) directory:

```javascript
const accessKey = "${ACCESS_KEY}"; // obtained from Picovoice Console (https://console.picovoice.ai/)

let wakeWordPath = '';
let contextPath = '';

if (Platform.OS == 'android') {
    wakeWordPath = `keyword_android.ppn`;
    contextPath = `context_android.rhn`;
} else if (Platform.OS == 'ios') {
    wakeWordPath = `keyword_ios.ppn`;
    contextPath = `context_ios.rhn`;
}
```

Alternatively, if the model files are deployed to the device with a different method, the absolute paths to the files on device can be used.

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demo App

Check out the [Picovoice React Native demo](https://github.com/Picovoice/picovoice/tree/master/demo/react-native) to see what it looks like to use Picovoice in a cross-platform app!
