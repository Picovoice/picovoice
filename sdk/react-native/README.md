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

This binding is for running Picovoice on **React Native 0.62.2+** on the following platforms:

- Android 4.1+ (API 16+)
- iOS 9.0+

## Installation

To start installation be sure you have installed yarn and cocoapods. Then add these native modules to your React Native project.

```sh
yarn add @picovoice/react-native-voice-processor
yarn add @picovoice/porcupine-react-native
yarn add @picovoice/rhino-react-native
yarn add @picovoice/picovoice-react-native
```
or
```sh
npm i @picovoice/react-native-voice-processor
npm i @picovoice/porcupine-react-native
npm i @picovoice/rhino-react-native
npm i @picovoice/picovoice-react-native
```

Link the iOS packages:

```sh
cd ios && pod install && cd ..
```

**NOTE**: Due to a limitation in React Native CLI autolinking, these native modules cannot be included as transitive depedencies. If you are creating a module that depends on these packages you will have to list these as peer dependencies and require developers to install them alongside.

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

[PicovoiceManager](/sdk/react-native/src/picovoicemanager.tsx) provides a high-level API that takes care of
audio recording. This class is the quickest way to get started.

The static constructor `PicovoiceManager.create` will create an instance of a PicovoiceManager using a Porcupine keyword file and Rhino context file that you pass to it.
```javascript
this._picovoiceManager = PicovoiceManager.create(
    '/path/to/keyword/file.ppn',
    wakeWordCallback,
    '/path/to/context/file.rhn',
    inferenceCallback);
```

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

```javascript
wakeWordCallback(){    
    // wake word detected!
}

inferenceCallback(inference){
    // `inference` is a JSON object with the following fields:
    // (1) isUnderstood
    // (2) intent
    // (3) slots
}
```

You can override the default model files and sensitivities:
```javascript
let porcupineSensitivity = 0.7
let rhinoSensitivity = 0.6
this._picovoiceManager = PicovoiceManager.create(
            '/path/to/keyword/file.ppn',
            wakeWordCallback,
            '/path/to/context/file.rhn',
            inferenceCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine/model.pv",
            "/path/to/rhino/model.pv");
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

There is no need to deal with audio capture to enable intent inference with PicovoiceManager.
This is because it uses our
[@picovoice/react-native-voice-processor](https://github.com/Picovoice/react-native-voice-processor/)
module to capture frames of audio and automatically pass it to Picovoice.

#### Low-Level API

[Picovoice](/sdk/react-native/src/picovoice.tsx) provides low-level access to the Picovoice platform for those
who want to incorporate it into a already existing audio processing pipeline.

`Picovoice` is created by passing a a Porcupine keyword file and Rhino context file to the `create` static constructor. Sensitivity and model files are optional.

```javascript
async createPicovoice(){
    let porcupineSensitivity = 0.7
    let rhinoSensitivity = 0.6

    try{
        this._picovoice = await Picovoice.create(
            '/path/to/keyword/file.ppn',
            wakeWordCallback,
            '/path/to/context/file.rhn',
            inferenceCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine/model.pv",
            "/path/to/rhino/model.pv")
    } catch (err) {
        // handle error
    }
}

wakeWordCallback(){    
    // wake word detected!    
}

inferenceCallback(inference){
    // `inference` is a JSON object with the following fields:
    // (1) isUnderstood
    // (2) intent
    // (3) slots
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

## Custom Model Integration

To add custom models to your React Native application you'll need to add the files to your platform projects. Android models must be added to `./android/app/src/main/res/raw/`, while iOS models can be added anywhere under `./ios`, but must be included as a bundled resource in your iOS project. Then in your app javascript code, using the [react-native-fs](https://www.npmjs.com/package/react-native-fs) package, retreive the files like so:
```javascript
const RNFS = require('react-native-fs');

let wakeWordName = 'keyword';
let wakeWordFilename = wakeWordName;
let wakeWordPath = '';
let contextName = 'context';
let contextFilename = contextName;
let contextPath = '';

if (Platform.OS == 'android') {
    // for Android, extract resources from APK
    wakeWordFilename += '_android.ppn';
    wakeWordPath = `${RNFS.DocumentDirectoryPath}/${wakeWordFilename}`;
    await RNFS.copyFileRes(wakeWordFilename, wakeWordPath);

    contextFilename += '_android.rhn';
    contextPath = `${RNFS.DocumentDirectoryPath}/${contextFilename}`;
    await RNFS.copyFileRes(contextFilename, contextPath);
} else if (Platform.OS == 'ios') {
    wakeWordFilename += '_ios.ppn';
    wakeWordPath = `${RNFS.MainBundlePath}/${wakeWordFilename}`;

    contextFilename += '_ios.rhn';
    contextPath = `${RNFS.MainBundlePath}/${contextFilename}`;
}
```

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demo App

Check out the [Picovoice React Native demo](/demo/react-native) to see what it looks like to use Picovoice in a cross-platform app!

