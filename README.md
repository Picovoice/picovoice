# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is the end-to-end platform for building voice products on your terms. Unlike Alexa and Google services,
Picovoice runs entirely on-device while being more accurate. Using Picovoice, one can infer a user’s intent from a
naturally spoken utterance such as:

> "Hey Edison, set the lights in the living room to blue"

Picovoice detects the occurrence of the custom wake word (`Hey Edison`), and then extracts the intent from the follow-on
spoken command:

```json
{
  "intent": "changeColor",
  "slots": {
    "location": "living room",
    "color": "blue"
  }
}
```

## Why Picovoice

- **Private & Secure:** Everything is processed offline. Intrinsically private; HIPAA and GDPR compliant.
- **Accurate:** Resilient to noise and reverberation. Outperforms cloud-based alternatives by wide margins.
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks. Raspberry Pi, BeagleBone,
  Android, iOS, Linux (x86_64), macOS (x86_64), Windows (x86_64), and modern web browsers are supported. Enterprise customers
  can access the ARM Cortex-M SDK.
- **Self-Service:** Design, train, and test voice interfaces instantly in your browser, using [Picovoice Console](https://picovoice.ai/console/).
- **Reliable:** Runs locally without needing continuous connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.

## Build with Picovoice

1. **Evaluate:** The Picovoice SDK is a cross-platform library for adding voice to anything. It includes some
   pre-trained speech models. The SDK is licensed under Apache 2.0 and available on GitHub to encourage independent
   benchmarking and integration testing. You are empowered to make a data-driven decision.

2. **Design:** [Picovoice Console](https://picovoice.ai/console/) is a cloud-based platform for designing voice
   interfaces and training speech models, all within your web browser. No machine learning skills are required. Simply
   describe what you need with text and export trained models.

3. **Develop:** Exported models can run on Picovoice SDK without requiring constant connectivity. The SDK runs on a wide
   range of platforms and supports a large number of frameworks. The Picovoice Console and Picovoice SDK enable you to
   design, build and iterate fast.

4. **Deploy:** Deploy at scale without having to maintain complex cloud infrastructure. Avoid unbounded cloud fees,
   limitations, and control imposed by big tech.

[![Picovoice in Action](https://img.youtube.com/vi/X12N2Rn-q5o/0.jpg)](https://www.youtube.com/watch?v=X12N2Rn-q5o)

## Platform Features

### Custom Wake Words

Picovoice makes use of the [Porcupine wake word engine](https://github.com/Picovoice/porcupine) to detect utterances of
given wake phrases. You can train custom wake words using Picovoice Console and then run the exported wake word model on
the Picovoice SDK.

### Intent Inference

Picovoice relies on the [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) to directly infer user's
intent from spoken commands within a given domain of interest (a "context"). You can design and train custom contexts
for your product using Picovoice Console. The exported Rhino models then can run with the Picovoice SDK on any supported
platform.

## License & Terms

The Picovoice SDK is free and licensed under Apache 2.0 including the models released within. [Picovoice Console](https://picovoice.ai/console/) offers
two types of subscriptions: Personal and Enterprise. Personal accounts can train custom speech models that run on the
Picovoice SDK, subject to limitations and strictly for non-commercial purposes. Personal accounts empower researchers,
hobbyists, and tinkerers to experiment. Enterprise accounts can unlock all capabilities of Picovoice Console, are
permitted for use in commercial settings, and have a path to graduate to commercial distribution[<sup>\*</sup>](https://picovoice.ai/pricing/).

## Table of Contents

- [Picovoice](#picovoice)
  - [Why Picovoice?](#why-picovoice)
  - [Build with Picovoice](#build-with-picovoice)
  - [Platform Features](#platform-features)
  - [Table of Contents](#table-of-contents)
  - [Language Support](#language-support)
  - [Performance](#performance)
  - [Picovoice Console](#picovoice-console)
  - [Demos](#demos)
    - [Python](#python-demos)
    - [NodeJS](#nodejs-demos)
    - [.NET](#net-demos)
    - [Java](#java-demos)
    - [Unity](#unity-demos)
    - [Flutter](#flutter-demos)
    - [React Native](#react-native-demos)
    - [Android](#android-demos)
    - [iOS](#ios-demos)
    - [Web](#web-demos)
      - [Vanilla JavaScript and HTML](#vanilla-javascript-and-html)
      - [Angular](#angular-demos)
      - [React](#react-demos)
      - [Vue](#vue-demos)
    - [Microcontroller](#microcontroller-demos)
  - [SDKs](#sdks)
    - [Python](#python)
    - [NodeJS](#nodejs)
    - [.NET](#net)
    - [Java](#java)
    - [Unity](#unity)
    - [Flutter](#flutter)
    - [React Native](#react-native)
    - [Android](#android)
    - [iOS](#ios)
    - [Web](#web)
      - [Vanilla JavaScript and HTML (CDN Script Tag)](#vanilla-javascript-and-html-cdn-script-tag)
      - [Vanilla JavaScript and HTML (ES Modules)](#vanilla-javascript-and-html-es-modules)
      - [Angular](#angular)
      - [React](#react)
      - [Vue](#vue)
    - [Microcontroller](#microcontroller)
  - [Releases](#releases)
  - [FAQ](#faq)

## Language Support

- English, German, French, and Spanish.
- Support for additional languages is available for commercial customers on a case-by-case basis.

## Performance

Picovoice makes use of the [Porcupine wake word engine](https://github.com/Picovoice/porcupine) to detect utterances of
given wake phrases. An open-source benchmark of Porcupine is available
[here](https://github.com/Picovoice/wakeword-benchmark). In summary, compared to the best-performing alternative,
Porcupine's standard model is **5.4 times more accurate**.

![](resources/doc/porcupine-benchmark.png)

Picovoice relies on the [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) to directly infer user's
intent from spoken commands within a given domain of interest (a "context"). An open-source benchmark of Rhino is
available [here](https://github.com/Picovoice/speech-to-intent-benchmark). Rhino outperforms all major cloud-based
alternatives with wide margins.

![](resources/doc/rhino-benchmark.png)

## Picovoice Console

[Picovoice Console](https://picovoice.ai/console/) is a web-based platform for designing, testing, and training voice
user interfaces. Using Picovoice Console you can train custom wake word, and domain-specific NLU (Speech-to-Intent)
models.

## Demos

If using SSH, clone the repository with:

```bash
git clone --recurse-submodules git@github.com:Picovoice/picovoice.git
```

If using HTTPS, clone the repository with:

```bash
git clone --recurse-submodules https://github.com/Picovoice/picovoice.git
```

### Python Demos

Install [PyAudio](https://people.csail.mit.edu/hubert/pyaudio/) and then the demo package:

```bash
sudo pip3 install picovoicedemo
```

From the root of the repository run the following in the terminal:

```bash
picovoice_demo_mic \
--keyword_path resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
--context_path resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `raspberry-pi`, `beaglebone`, `linux`, `mac`,
or `windows`). The microphone demo opens an audio stream from the microphone, detects utterances of a given wake
phrase, and infers intent from the follow-on spoken command. Once the demo initializes, it prints `[Listening ...]`
to the console. Then say:

> Porcupine, set the lights in the kitchen to purple.

Upon success, the demo prints the following into the terminal:

```text
[wake word]

{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'purple'
  }
}
```

For more information regarding Python demos refer to their [documentation](/demo/python/README.md).

### NodeJS Demos

Make sure there is a working microphone connected to your device. Refer to documentation within
[node-record-lpm16](https://www.npmjs.com/package/node-record-lpcm16) to set up your microphone for access from NodeJS.
Then install the demo package:

```bash
npm install -g @picovoice/picovoice-node-demo
```

From the root of the repository run:

```bash
pv-mic-demo \
-k resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
-c resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `raspberry-pi`, `linux`, or `mac`). The
microphone demo opens an audio stream from the microphone, detects utterances of a given wake
phrase, and infers intent from the follow-on spoken command. Once the demo initializes, it prints
`Listening for wake word 'porcupine' ...` to the console. Then say:

> Porcupine, turn on the lights.

Upon success, the demo prints the following into the terminal:

```text
Inference:
{
    "isUnderstood": true,
    "intent": "changeLightState",
    "slots": {
        "state": "on"
    }
}
```

Please see the [demo instructions](./demo/nodejs/README.md) for details.

### .NET Demos

Install [OpenAL](https://openal.org/). From the root of the repository run the following in the terminal:

```bash
dotnet run -p demo/dotnet/PicovoiceDemo/PicovoiceDemo.csproj -c MicDemo.Release -- \
--keyword_path resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
--context_path resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `linux`, `mac`, or `windows`). The microphone
demo opens an audio stream from the microphone, detects utterances of a given wake phrase, and infers intent from the
follow-on spoken command. Once the demo initializes, it prints `Listening...` to the console. Then say:

> Porcupine, set the lights in the kitchen to orange.

Upon success the following it printed into the terminal:

```text
[wake word]
{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'orange'
  }
}
```

For more information about .NET demos go to [demo/dotnet](/demo/dotnet/README.md).

### Java Demos

Make sure there is a working microphone connected to your device. Then, from the root of the repository run the
following in a terminal:

```bash
java -jar demo/java/bin/picovoice-mic-demo.jar \
-k resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
-c resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `linux`, `mac`, or `windows`). The microphone
demo opens an audio stream from the microphone, detects utterances of a given wake phrase, and infers intent from the
follow-on spoken command. Once the demo initializes, it prints `Listening ...` to the console. Then say:

> Porcupine, set the lights in the kitchen to orange.

Upon success the following it printed into the terminal:

```text
[wake word]
{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'orange'
  }
}
```

For more information about the Java demos go to [demo/java](/demo/java/README.md).

### Unity Demos

To run the Picovoice Unity demo, import the [Picovoice Unity package](/sdk/unity/picovoice.unitypackage) into your project, open the PicovoiceDemo scene and hit play. To run on other platforms or in the player, go to _File > Build Settings_, choose your platform and hit the `Build and Run` button.

To browse the demo source go to [demo/unity](/demo/unity).

### Flutter Demos

To run the Picovoice demo on Android or iOS with Flutter, you must have the [Flutter SDK](https://flutter.dev/docs/get-started/install) installed on your system. Once installed, you can run `flutter doctor` to determine any other missing requirements for your relevant platform. Once your environment has been set up, launch a simulator or connect an Android/iOS device. 

Before launching the app, use the copy_assets.sh script to copy the Picovoice demo assets into the demo project. (**NOTE**: on Windows, Git Bash or another bash shell is required, or you will have to manually copy the context into the project.).

Run the following command from [demo/flutter](/demo/flutter/) to build and deploy the demo to your device:
```sh
flutter run
```

Once the application has been deployed, press the start button and say:

> Picovoice, turn of the lights in the kitchen.

For the full set of supported commands refer to [demo's readme](/demo/flutter/README.md).

### React Native Demos
To run the React Native Picovoice demo app you'll first need to install yarn and setup your React Native environment. For this, please refer to [React Native's documentation](https://reactnative.dev/docs/environment-setup). Once your environment has been set up, you can run the following commands:

#### Running On Android
```sh
cd demo/react-native
yarn android-install    # sets up environment
yarn android-run        # builds and deploys to Android
```

#### Running On iOS

```sh
cd demo/react-native
yarn ios-install        # sets up environment
yarn ios-run            # builds and deploys to iOS
```

Once the application has been deployed, press the start button and say

> Porcupine, turn of the lights in the kitchen.

For the full set of supported commands refer to [demo's readme](/demo/react-native/README.md).

### Android Demos

Using Android Studio, open [demo/android/Activity](/demo/android/Activity) as an Android project and then run the
application. Press the start button and say

> Porcupine, turn of the lights in the kitchen.

For the full set of supported commands refer to [demo's readme](/demo/android/README.md).

### iOS Demos

Using Xcode, open [demo/ios/PicovoiceDemo/PicovoiceDemo.xcodeproj](/demo/ios/PicovoiceDemo/PicovoiceDemo.xcodeproj) and
run the application. Press the start button and say

> Porcupine, shut of the lights in the living room.

For the full set of supported commands refer to [demo's readme](/demo/android/README.md).

### Web Demos

#### Vanilla JavaScript and HTML

From [demo/web](/demo/web) run the following in the terminal:

```console
yarn
yarn start
```

(or)

```console
npm install
npm run start
```

Open http://localhost:5000 in your browser to try the demo.

#### Angular Demos

From [demo/angular](/demo/angular) run the following in the terminal:

```console
yarn
yarn start
```

(or)

```console
npm install
npm run start
```

Open http://localhost:4200 in your browser to try the demo.

#### React Demos

From [demo/react](/demo/react) run the following in the terminal:

```console
yarn
yarn start
```

(or)

```console
npm install
npm run start
```

Open http://localhost:3000 in your browser to try the demo.

#### Vue Demos

From [demo/vue](/demo/vue) run the following in the terminal:

```console
yarn
yarn serve
```

(or)

```console
npm install
npm run serve
```

Open http://localhost:8080 in your browser to try the demo.

### Microcontroller Demos

There are several projects for various development boards inside the [mcu demo](./demo/mcu) folder.

## SDKs

### Python

Install the package:

```bash
pip3 install picovoice
```

Create a new instance of Picovoice:

```python
from picovoice import Picovoice

keyword_path = ...

def wake_word_callback():
    pass

context_path = ...

def inference_callback(inference):
    print(inference.is_understood)
    print(inference.intent)
    print(inference.slots)

handle = Picovoice(
        keyword_path=keyword_path,
        wake_word_callback=wake_word_callback,
        context_path=context_path,
        inference_callback=inference_callback)
```

`handle` is an instance of the Picovoice runtime engine. It detects utterances of wake phrase defined in the file located at
`keyword_path`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `context_path`. `keyword_path` is the absolute path to the
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` extension).
`context_path` is the absolute path to the [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` extension). `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is
invoked upon completion of follow-on voice command inference.

When instantiated, the required rate can be obtained via `handle.sample_rate`. Expected number of audio samples per
frame is `handle.frame_length`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio. The
set of supported commands can be retrieved (in YAML format) via `handle.context_info`.

```python
def get_next_audio_frame():
    pass

while True:
    handle.process(get_next_audio_frame())
```

When done, resources have to be released explicitly `handle.delete()`.

### NodeJS

The Picovoice SDK for NodeJS is available from NPM:

```bash
yarn add @picovoice/picovoice-node
```

(or)

```bash
npm install @picovoice/picovoice-node
```

The SDK provides the `Picovoice` class. Create an instance of this class using a Porcupine keyword (with `.ppn` extension)
and Rhino context file (with `.rhn` extension), as well as callback functions that will be invoked on wake word detection
and command inference completion events, respectively:

```javascript
const Picovoice = require("@picovoice/picovoice-node");

let keywordCallback = function (keyword) {
  console.log(`Wake word detected`);
};

let inferenceCallback = function (inference) {
  console.log("Inference:");
  console.log(JSON.stringify(inference, null, 4));
};

let handle = new Picovoice(
  keywordArgument,
  keywordCallback,
  contextPath,
  inferenceCallback
);
```

The `keywordArgument` can either be a path to a Porcupine keyword file (.ppn), or one of the built-in keywords
(integer enums). The `contextPath` is the path to the Rhino context file (.rhn).

Upon constructing the Picovoice class, send it frames of audio via its `process` method. Internally, Picovoice will
switch between wake word detection and inference. The Picovoice class includes `frameLength` and `sampleRate` properties
for the format of audio required.

```javascript
// process audio frames that match the Picovoice requirements (16-bit linear pcm audio, single-channel)
while (true) {
  handle.process(frame);
}
```

As the audio is processed through the Picovoice engines, the callbacks will fire.

### .NET

You can install the latest version of Picovoice by adding the latest
[Picovoice NuGet package](https://www.nuget.org/packages/Picovoice/) in Visual Studio or using the .NET CLI.

```bash
dotnet add package Picovoice
```

To create an instance of Picovoice, do the following:

```csharp
using Pv;

string keywordPath = "/absolute/path/to/keyword.ppn";

void wakeWordCallback() => {..}

string contextPath = "/absolute/path/to/context.rhn";

void inferenceCallback(Inference inference)
{
    // `inference` exposes three immutable properties:
    // (1) `IsUnderstood`
    // (2) `Intent`
    // (3) `Slots`
    // ..
}

Picovoice handle = new Picovoice(keywordPath,
                                 wakeWordCallback,
                                 contextPath,
                                 inferenceCallback);

```

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in the file located at
`keywordPath`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `contextPath`. `keywordPath` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` extension).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` extension). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, the required sample rate can be obtained via `handle.SampleRate`. The expected number of audio samples per
frame is `handle.FrameLength`. The Picovoice engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```csharp
short[] GetNextAudioFrame()
{
    // .. get audioFrame
    return audioFrame;
}

while(true)
{
    handle.Process(GetNextAudioFrame());
}
```

Porcupine will have its resources freed by the garbage collector, but to have resources freed
immediately after use, wrap it in a `using` statement:

```csharp
using(Picovoice handle = new Picovoice(keywordPath, wakeWordCallback, contextPath, inferenceCallback))
{
    // .. Picovoice usage here
}
```

### Java

You can add the Picovoice Java SDK by downloading and referencing the latest Picovoice JAR available [here](/sdk/java/bin).

The easiest way to create an instance of the engine is with the Picovoice Builder:

```java
import ai.picovoice.picovoice.*;

String keywordPath = "/absolute/path/to/keyword.ppn"

PicovoiceWakeWordCallback wakeWordCallback = () -> {..};

String contextPath = "/absolute/path/to/context.rhn"

PicovoiceInferenceCallback inferenceCallback = inference -> {
    // `inference` exposes three getters:
    // (1) `getIsUnderstood()`
    // (2) `getIntent()`
    // (3) `getSlots()`
    // ..
};

try{
    Picovoice handle = new Picovoice.Builder()
                    .setKeywordPath(keywordPath)
                    .setWakeWordCallback(wakeWordCallback)
                    .setContextPath(contextPath)
                    .setInferenceCallback(inferenceCallback)
                    .build();
} catch (PicovoiceException e) { }
```

`handle` is an instance of the Picovoice runtime engine that detects utterances of wake phrase defined in the file located at
`keywordPath`. Upon detection of wake word it starts inferring the user's intent from the follow-on voice command within
the context defined by the file located at `contextPath`. `keywordPath` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` extension).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` extension). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, the required sample rate can be obtained via `handle.getSampleRate()`. The expected number of audio samples per
frame is `handle.getFrameLength()`. The Picovoice engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```java
short[] getNextAudioFrame()
{
    // .. get audioFrame
    return audioFrame;
}

while(true)
{
    handle.process(getNextAudioFrame());
}
```

Once you're done with Picovoice, ensure you release its resources explicitly:

```java
handle.delete();
```

### Unity

Import the [Picovoice Unity Package](/sdk/unity/picovoice.unitypackage) into your Unity project.

The SDK provides two APIs:

#### High-Level API

[PicovoiceManager](/sdk/unity/Assets/Picovoice/PicovoiceManager.cs) provides a high-level API that takes care of audio recording. This is the quickest way to get started.

The constructor `PicovoiceManager.Create` will create an instance of the PicovoiceManager using the Porcupine keyword and Rhino context files that you pass to it.
```csharp
using Pv.Unity;

try 
{    
    PicovoiceManager _picovoiceManager = PicovoiceManager.Create(
                                    "/path/to/keyword/file.ppn",
                                    (keywordIndex) => {},
                                    "/path/to/context/file.rhn",
                                    (inference) => {};
}
catch (Exception ex)
{
    // handle picovoice init error
}
```

Once you have instantiated a PicovoiceManager, you can start audio capture and processing by calling:
```csharp
_picovoiceManager.Start();
// .. use picovoice
_picovoiceManager.Stop();
```

Once the app is done with using an instance of PicovoiceManager, you can explicitly release the audio resources and the resources allocated to Picovoice:
```csharp
_picovoiceManager.Delete();
```

PicovoiceManager uses our
[unity-voice-processor](https://github.com/Picovoice/unity-voice-processor/)
Unity package to capture frames of audio and automatically pass it to the Picovoice platform.

#### Low-Level API

[Picovoice](/sdk/unity/Assets/Picovoice/Picovoice.cs) provides low-level access to the Picovoice platform for those
who want to incorporate it into a already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file and Rhino context file to the `Create` static constructor.

```csharp
using Pv.Unity;

try
{    
    Picovoice _picovoice = Picovoice.Create(
                                "path/to/keyword/file.ppn",
                                OnWakeWordDetected,
                                "path/to/context/file.rhn",
                                OnInferenceResult);
} 
catch (Exception ex) 
{
    // handle Picovoice init error
}
```

To use Picovoice, you must pass frames of audio to the `Process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```csharp
short[] GetNextAudioFrame()
{
    // .. get audioFrame
    return audioFrame;
}

short[] buffer = GetNextAudioFrame();
try 
{
    _picovoice.Process(buffer);
}
catch (Exception ex)
{
    Debug.LogError(ex.ToString());
}  
```

For `Process` to work correctly, the provided audio must be single-channel and 16-bit linearly-encoded.

Picovoice implements the `IDisposable` interface, so you can use Picovoice in a `using` block. If you don't use a `using` block, resources will be released by the garbage collector automatically or you can explicitly release the resources like so:

```csharp
_picovoice.Dispose();
```

### Flutter

Add the [Picovoice Flutter package](https://pub.dev/packages/picovoice) to your pub.yaml.
```yaml
dependencies:  
  picovoice: ^<version>
```
The SDK provides two APIs:

#### High-Level API

[PicovoiceManager](/sdk/flutter/lib/picovoice_manager.dart) provides a high-level API that takes care of
audio recording. This class is the quickest way to get started.

The static constructor `PicovoiceManager.create` will create an instance of a PicovoiceManager using a Porcupine keyword file and Rhino context file that you pass to it.
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

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

Once you have instantiated a PicovoiceManager, you can start/stop audio capture and processing by calling:

```dart
await _picovoiceManager.start();
// .. use for detecting wake words and commands
await _picovoiceManager.stop();
```

Once the app is done with using an instance of PicovoiceManager, be sure you explicitly release the resources allocated to Picovoice:
```dart
await _picovoiceManager.delete();
```

Our [flutter_voice_processor](https://github.com/Picovoice/flutter-voice-processor/)
Flutter plugin handles audio capture and passes frames to Picovoice for you.

#### Low-Level API

[Picovoice](/sdk/flutter/lib/picovoice.dart) provides low-level access to the Picovoice platform for those
who want to incorporate it into a already existing audio processing pipeline.

`Picovoice` is created by passing a a Porcupine keyword file and Rhino context file to the `create` static constructor. Sensitivity and model files are optional.

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
```

To use Picovoice, just pass frames of audio to the `process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```dart
List<int> buffer = getAudioFrame();

try {
    _picovoice.process(buffer);
} on PvError catch (error) {
    // handle error
}

// once you are done using Picovoice
_picovoice.delete();
```

### React Native

First add our React Native modules to your project via yarn or npm:
```sh
yarn add @picovoice/react-native-voice-processor
yarn add @picovoice/porcupine-react-native
yarn add @picovoice/rhino-react-native
yarn add @picovoice/picovoice-react-native
```

The [@picovoice/picovoice-react-native](https://www.npmjs.com/package/@picovoice/picovoice-react-native) package exposes a high-level and a low-level API for integrating Picovoice into your application.

#### High-Level API

[PicovoiceManager](/sdk/react-native/src/picovoicemanager.tsx) provides a high-level API that takes care of
audio recording. This class is the quickest way to get started.

The static constructor `PicovoiceManager.create` will create an instance of a PicovoiceManager using a Porcupine keyword file and Rhino context file that you pass to it.
```javascript
async createPicovoiceManager(){
    try{
        this._picovoiceManager = await PicovoiceManager.create(
            '/path/to/keyword/file.ppn',
            wakeWordCallback,
            '/path/to/context/file.rhn',
            inferenceCallback);
    } catch (err) {
        // handle error
    }
}
```

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

Once you have instantiated a PicovoiceManager, you can start/stop audio capture and processing by calling:

```javascript
let didStart = await this._picovoiceManager.start();
// .. use for detecting wake words and commands
let didStop = await this._picovoiceManager.stop();
```

Once the app is done with using PicovoiceManager, be sure you explicitly release the resources allocated for it:
```javascript
this._picovoiceManager.delete();
```

[@picovoice/react-native-voice-processor](https://github.com/Picovoice/react-native-voice-processor/)
module handles audio capture and passes frames to Picovoice for you.

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
```

To use Picovoice, just pass frames of audio to the `process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```javascript
let buffer = getAudioFrame();

try {
    await this._picovoice.process(buffer);
} catch (e) {
    // handle error
}

// once you are done
this._picovoice.delete();
```

### Android

There are two possibilities for integrating Picovoice into an Android application.

#### High-Level API

[PicovoiceManager](/sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/PicovoiceManager.java) provides
a high-level API for integrating Picovoice into Android applications. It manages all activities related to creating an
input audio stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and
inference completion. The class can be initialized as follows:

```java
import ai.picovoice.picovoice.PicovoiceManager;

final String porcupineModelPath = ...
final String keywordPath = ...
final float porcupineSensitivity = 0.5f;
final String rhinoModelPath = ...
final String contextPath = ...
final float rhinoSensitivity = 0.5f;

PicovoiceManager manager = new PicovoiceManager(
    porcupineModelPath,
    keywordPath,
    porcupineSensitivity,
    new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            // logic to execute upon deletection of wake word
        }
    },
    rhinoModelPath,
    contextPath,
    rhinoSensitivity,
    new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            // logic to execute upon completion of intent inference
        }
    }
);
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating point number within
[0, 1]. A higher sensitivity reduces miss rate at cost of increased false alarm rate.

When initialized, input audio can be processed using:

```java
manager.start();
```

Stop the manager with:

```java
manager.stop();
```

When done be sure to release resources:

```java
manager.delete();
```

#### Low-Level API

[Picovoice.java](/sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/Picovoice.java) provides a
low-level binding for Android. It can be initialized as follows:

```java
import ai.picovoice.picovoice.Picovoice;

final String porcupineModelPath = ...
final String keywordPath = ...
final float porcupineSensitivity = 0.5f;
final String rhinoModelPath = ...
final String contextPath = ...
final float rhinoSensitivity = 0.5f;

Picovoice picovoice = new Picovoice(
    porcupineModelPath,
    keywordPath,
    porcupineSensitivity,
    new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            // logic to execute upon deletection of wake word
        }
    },
    rhinoModelPath,
    contextPath,
    rhinoSensitivity,
    new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            // logic to execute upon completion of intent inference
        }
    }
);
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating point number within
[0, 1]. A higher sensitivity reduces miss rate at cost of increased false alarm rate.

Once initialized, `picovoice` can be used to process incoming audio.

```java
private short[] getNextAudioFrame();

while (true) {
    try {
        picovoice.process(getNextAudioFrame());
    } catch (PicovoiceException e) {
        // error handling logic
    }
}
```

Finally, be sure to explicitly release resources acquired as the binding class does not rely on the garbage collector
for releasing native resources:

```java
picovoice.delete();
```

### iOS

[PicovoiceManager](/sdk/ios/PicovoiceManager.swift) class manages all activities related to creating an audio input
stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and completion of
intent inference. The class can be initialized as below:

```swift
let porcupineModelpath: String = ...
let keywordPath: String = ...
let porcupineSensitivity: Float32 = 0.5
let rhinoModelPath: String = ...
let contextPath: String = ...
let rhinoSensitivity: Float32 = 0.5
let manager = PicovoiceManager(
    porcupineModelpath: porcupineModelpath,
    keywordPath: keywordPath,
    porcupineSensitivity: porcupineSensitivity,
    onWakeWordDetection: {
        // logic to execute upon wake word detection.
    },
    rhinoModelPath: rhinoModelPath,
    contextPath: contextPath,
    rhinoSensitivity: rhinoSensitivity,
    onInference: {
        // logic to execute upon intent inference completion.
    }
)
```

when initialized input audio can be processed using `manager.start()`. The processing can be interrupted using
`manager.stop()`.

### Web

The Picovoice SDK for Web is available on modern web browsers (i.e. not Internet Explorer) via [WebAssembly](https://webassembly.org/). Microphone audio is handled via the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) and is abstracted by the WebVoiceProcessor, which also handles downsampling to the correct format. Picovoice is provided pre-packaged as a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers).

Each spoken language is available as a dedicated npm package (e.g. @picovoice/picovoice-web-en-worker). These packages can be used with the @picovoice/web-voice-processor. They can also be used with the Angular, React, and Vue bindings, which abstract and hide the web worker communication details.

#### Vanilla JavaScript and HTML (CDN Script Tag)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="https://unpkg.com/@picovoice/picovoice-web-en-worker/dist/iife/index.js"></script>
    <script src="https://unpkg.com/@picovoice/web-voice-processor/dist/iife/index.js"></script>
    <script type="application/javascript">
      const RHINO_CONTEXT_BASE64 = /* Base64 representation of Rhino .rhn file */;

      async function startPicovoice() {
        console.log("Picovoice is loading. Please wait...");
        picovoiceWorker = await PicovoiceWebEnWorker.PicovoiceWorkerFactory.create(
          {
            porcupineKeyword: { builtin: "Picovoice" },
            rhinoContext: { base64: RHINO_CONTEXT_BASE64 },
            start: true,
          }
        );

        console.log("Picovoice worker ready!");

        picovoiceWorker.onmessage = (msg) => {
          switch (msg.data.command) {
            case "ppn-keyword": {
              console.log(
                "Wake word detected: " + JSON.stringify(msg.data.keywordLabel)
              );
              break;
            }
            case "rhn-inference":
              {
                console.log(
                  "Inference detected: " + JSON.stringify(msg.data.inference)
                );
                break;
              }

              writeMessage(msg);
          }
        };

        console.log(
          "WebVoiceProcessor initializing. Microphone permissions requested ..."
        );

        try {
          let webVp = await WebVoiceProcessor.WebVoiceProcessor.init({
            engines: [picovoiceWorker],
            start: true,
          });
          console.log(
            "WebVoiceProcessor ready! Say 'Picovoice' to start the interaction."
          );
        } catch (e) {
          console.log("WebVoiceProcessor failed to initialize: " + e);
        }
      }

      document.addEventListener("DOMContentLoaded", function () {
        startPicovoice();
      });
    </script>
  </head>
  <body>
  </body>
</html>

```

#### Vanilla JavaScript and HTML (ES Modules)

```console
yarn add @picovoice/picovoice-web-en-worker @picovoice/web-voice-processor
```

(or)

```console
npm install @picovoice/picovoice-web-en-worker @picovoice/web-voice-processor
```

```javascript
import { WebVoiceProcessor } from "@picovoice/web-voice-processor"
import { PicovoiceWorkerFactory } from "@picovoice/picovoice-web-en-worker";
 
async function startPicovoice() {
  // Create a Picovoice Worker (English language) to listen for
  // the built-in keyword "Picovoice" and follow-on commands in the given Rhino context.
  // Note: you receive a Web Worker object, _not_ an individual Picovoice instance
  const picovoiceWorker = await PicovoiceWorkerFactory.create(
    {
      porcupineKeyword: { builtin: "Picovoice" },
      rhinoContext: { base64: RHINO_CONTEXT_BASE64 },
      start: true,
    }
  );
 
  // The worker will send a message with data.command = "ppn-keyword" upon a detection event
  // And data.command = "rhn-inference" when the follow-on inference concludes.
  // Here, we tell it to log it to the console:
  picovoiceWorker.onmessage = (msg) => {
    switch (msg.data.command) {
      case 'ppn-keyword':
        // Wake word detection
        console.log("Wake word: " + msg.data.keywordLabel);
        break;
      case 'rhn-inference:
        // Follow-on command inference concluded
        console.log("Inference: " + msg.data.inference)
      default:
        break;
    }
  };
 
  // Start up the web voice processor. It will request microphone permission
  // and immediately (start: true) start listening.
  // It downsamples the audio to voice recognition standard format (16-bit 16kHz linear PCM, single-channel)
  // The incoming microphone audio frames will then be forwarded to the Picovoice Worker
  // n.b. This promise will reject if the user refuses permission! Make sure you handle that possibility.
  const webVp = await WebVoiceProcessor.init({
    engines: [picovoiceWorker],
    start: true,
  });
}
 
startPicovoice()
 
...
 
// Finished with Picovoice? Release the WebVoiceProcessor and the worker.
if (done) {
  webVp.release()
  picovoiceWorker.sendMessage({command: "release"})
}
```

#### Angular

```console
yarn add @picovoice/picovoice-web-angular @picovoice/picovoice-web-en-worker
```

(or)

```console
npm install @picovoice/picovoice-web-angular @picovoice/picovoice-web-en-worker
```

```typescript
import { Subscription } from "rxjs"
import { PicovoiceService } from "@picovoice/picovoice-web-angular"
 
...
 
  constructor(private picovoiceService: PicovoiceService) {
    // Subscribe to Picovoice Keyword detections
    // Store each detection so we can display it in an HTML list
    this.keywordDetection = picovoiceService.keyword$.subscribe(
      keywordLabel => this.detections = [...this.detections, keywordLabel])
    // Subscribe to Rhino Inference events
    // Show the latest one in the widget
    this.inferenceDetection = picovoiceService.inference$.subscribe(
      inference => this.latestInference = inference)
  }

    async ngOnInit() {
        // Load Picovoice worker chunk with specific language model (large ~4-6MB chunk; dynamically imported)
        const pvFactoryEn = (await import('@picovoice/picovoice-web-en-worker')).PicovoiceWorkerFactory
        // Initialize Picovoice Service
        try {
        await this.picovoiceService.init(pvFactoryEn,
            {
            // Built-in wake word
            porcupineKeyword: {builtin: "Hey Google", sensitivity: 0.6},
            // Rhino context (Base64 representation of a `.rhn` file)
            rhinoContext: { base64: RHINO_CONTEXT_BASE64 },
            start: true
            })
        }
        catch (error) {
        console.error(error)
        }
    }

    ngOnDestroy() {
        this.keywordDetection.unsubscribe()
        this.inferenceDetection.unsubscribe()
        this.picovoiceService.release()
    }
```

#### React

```console
yarn add @picovoice/picovoice-web-react @picovoice/picovoice-web-en-worker
```

(or)

```console
npm install @picovoice/picovoice-web-react @picovoice/picovoice-web-en-worker
```

```javascript
import React, { useState } from 'react';
import { PicovoiceWorkerFactory } from '@picovoice/picovoice-web-en-worker';
import { usePicovoice } from '@picovoice/picovoice-web-react';
 
const RHINO_CONTEXT_BASE64 = /* Base64 representation of English-language `.rhn` file, omitted for brevity */
 
export default function VoiceWidget() {
  const [keywordDetections, setKeywordDetections] = useState([]);
  const [inference, setInference] = useState(null);
 
  const inferenceEventHandler = (rhinoInference) => {
    console.log(rhinoInference);
    setInference(rhinoInference);
  };
 
  const keywordEventHandler = (porcupineKeywordLabel) => {
    console.log(porcupineKeywordLabel);
    setKeywordDetections((x) => [...x, porcupineKeywordLabel]);
  };
 
  const {
    isLoaded,
    isListening,
    isError,
    errorMessage,
    start,
    resume,
    pause,
    engine,
  } = usePicovoice(
    PicovoiceWorkerFactory,
    {
      // "Picovoice" is one of the builtin wake words, so we merely need to ask for it by name.
      // To use a custom wake word, you supply the `.ppn` files in base64 and provide a label for it.
      porcupineKeyword: "Picovoice",
      rhinoContext: { base64: RHINO_CONTEXT_BASE64 },
      start: true,
    },
    keywordEventHandler,
    inferenceEventHandler
  );
 
return (
  <div className="voice-widget">
    <h3>Engine: {engine}</h3>
    <h3>Keyword Detections:</h3>
    {keywordDetections.length > 0 && (
      <ul>
        {keywordDetections.map((label, index) => (
          <li key={index}>{label}</li>
        ))}
      </ul>
    )}
    <h3>Latest Inference:</h3>
    {JSON.stringify(inference)}
  </div>
)
```

#### Vue

```console
yarn add @picovoice/picovoice-web-vue @picovoice/picovoice-web-en-worker
```

(or)

```console
npm install @picovoice/picovoice-web-vue @picovoice/picovoice-web-en-worker
```

```html
<template>
  <div class="voice-widget">
    <Picovoice
      v-bind:picovoiceFactoryArgs="{ start: true, porcupineKeyword:
    'Picovoice', rhinoContext: { base64: '... Base64 representation of a .rhn file ...'}"
      v-bind:picovoiceFactory="factory"
      v-on:pv-init="pvInitFn"
      v-on:pv-ready="pvReadyFn"
      v-on:ppn-keyword="pvKeywordFn"
      v-on:rhn-inference="pvInferenceFn"
      v-on:pv-error="pvErrorFn"
    />
    <h3>Keyword Detections:</h3>
    <ul v-if="detections.length > 0">
      <li v-for="(item, index) in detections" :key="index">{{ item }}</li>
    </ul>
  </div>
</template>
<script>
import Picovoice from "@picovoice/picovoice-web-vue";
import { PicovoiceWorkerFactoryEn } from "@picovoice/picovoice-web-en-worker";
 
export default {
  name: "VoiceWidget",
  components: {
    Picovoice,
  },
  data: function() {
    return {
      detections: [],
      isError: null,
      isLoaded: false,
      factory: PicovoiceWorkerFactoryEn,
    };
  },
  methods: {
    pvInitFn: function () {
      this.isError = false;
    },
    pvReadyFn: function () {
      this.isLoaded = true;
      this.isListening = true;
      this.engine = 'ppn'
    },
    pvKeywordFn: function (keyword) {
      this.detections = [...this.detections, keyword];
      this.engine = 'rhn'
    },
    pvInferenceFn: function (inference) {
      this.inference = inference;
      this.engine = 'ppn'
    },
    pvErrorFn: function (error) {
      this.isError = true;
      this.errorMessage = error.toString();
    },
  },
};
</script>
```

### Microcontroller

Picovoice is implemented in ANSI C and therefore can be directly linked to embedded C projects. Its public header file contains relevant information. An instance of the Picovoice object can be constructed as follows:

```c
#define MEMORY_BUFFER_SIZE ...
static uint8_t memory_buffer[MEMORY_BUFFER_SIZE] __attribute__((aligned(16)));

static const uint8_t *keyword_array = ...
const float porcupine_sensitivity = 0.5f

static void wake_word_callback(void) {
    // logic to execute upon detection of wake word
}

static const uint8_t *context_array = ...
const float rhino_sensitivity = 0.75f

static void inference_callback(pv_inference_t *inference) {
    // `inference` exposes three immutable properties:
    // (1) `IsUnderstood`
    // (2) `Intent`
    // (3) `Slots`
    // ..
    pv_inference_delete(inference);
}

pv_picovoice_t *handle = NULL;

const pv_status_t status = pv_picovoice_init(
        MEMORY_BUFFER_SIZE,
        memory_buffer,
        sizeof(keyword_array),
        keyword_array,
        porcupine_sensitivity,
        wake_word_callback,
        sizeof(context_array),
        context_array,
        rhino_sensitivity,
        inference_callback,
        &handle);

if (status != PV_STATUS_SUCCESS) {
    // error handling logic
}
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating-point number
within [0, 1]. A higher sensitivity reduces miss rate (false reject rate) at cost of increased false alarm rate.

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in `keyword_array`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within the context defined in `context_array`. `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is invoked upon completion of follow-on voice command inference.

Picovoice accepts single channel, 16-bit PCM audio. The sample rate can be retrieved using `pv_sample_rate()`. Finally, Picovoice accepts input audio in consecutive chunks
(aka frames) the length of each frame can be retrieved using `pv_porcupine_frame_length()`.

```c
extern const int16_t *get_next_audio_frame(void);

while (true) {
    const int16_t *pcm = get_next_audio_frame();
    const pv_status_t status = pv_picovoice_process(handle, pcm);
    if (status != PV_STATUS_SUCCESS) {
        // error handling logic
    }
}
```

Finally, when done be sure to release the acquired resources.

```c
pv_picovoice_delete(handle);
```
## Releases

### v1.1.0 - December 2nd, 2020

- Improved accuracy.
- Runtime optimizations.
- .NET SDK.
- Java SDK.
- React Native SDK.
- C SDK.

### v1.0.0 - October 22, 2020

- Initial release.

## FAQ

You can find the FAQ [here](https://picovoice.ai/docs/faq/picovoice/).
