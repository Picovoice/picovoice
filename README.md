# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is the end-to-end platform for building voice products on your terms. Unlike Alexa and Google services,
Picovoice runs entirely on-device while being more accurate. Using Picovoice, one can infer a user’s intent from a
naturally spoken utterance such as:

> Hey Edison, set the lights in the living room to blue.

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
can access ARM Cortex-M SDK.
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

The Picovoice SDK is free and licensed under Apache 2.0 including the models released within. [Picovoice Console]((https://picovoice.ai/console/)) offers
two types of subscriptions: Personal and Enterprise. Personal accounts can train custom speech models that run on the
Picovoice SDK, subject to limitations and strictly for non-commercial purposes. Personal accounts empower researchers,
hobbyists, and tinkerers to experiment. Enterprise accounts can unlock all capabilities of Picovoice Console, are
permitted for use in commercial settings, and have a path to graduate to commercial distribution[<sup>*</sup>](https://picovoice.ai/pricing/).

## Table of Contents

- [Picovoice](#picovoice)
  - [Why Picovoice?](#why-picovoice)
  - [Build with Picovoice](#build-with-picovoice)
  - [Platform Features](#platform-features)
  - [Table of Contents](#table-of-contents)
  - [Performance](#performance)
  - [Picovoice Console](#picovoice-console)
  - [Demos](#demos)
    - [Python](#python-demos)
    - [NodeJS](#nodejs-demos)
    - [.NET](#net-demos)
    - [Java](#java-demos)
    - [Android](#android-demos)
    - [iOS](#ios-demos)
    - [JavaScript](#javascript-demos)
  - [SDKs](#sdks)
    - [Python](#python)
    - [NodeJS](#nodejs)
    - [.NET](#net-demos)
    - [Java](#java-demos)
    - [Android](#android)
    - [iOS](#ios)
  - [Releases](#releases)
  - [FAQ](#faq)

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

### JavaScript Demos

There is a ["Vanilla" JavaScript demo](./demo/javascript/vanilla) and [React demo](./demo/javascript/react) available,
both of which [run offline in the browser](https://picovoice.ai/blog/offline-voice-ai-in-a-web-browser/).

## SDKs

### Python

Install the package

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
    # `inference` exposes three immutable fields:
    # (1) `is_understood`
    # (2) `intent`
    # (3) `slots`
    pass

handle = Picovoice(
        keyword_path=keyword_path,
        wake_word_callback=wake_word_callback,
        context_path=context_path,
        inference_callback=inference_callback)
```

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in the file located at
`keyword_path`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `context_path`. `keyword_path` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`context_path` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` suffix). `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is
invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `handle.sample_rate`. Expected number of audio samples per
frame is `handle.frame_length`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio. The
set of supported commands can be retrieved (in YAML format) via `handle.context_info`.

```python
def get_next_audio_frame():
    pass

while True:
    handle.process(get_next_audio_frame())
```

When done resources have to be released explicitly

```python
handle.delete()
```

### NodeJS

The Picovoice SDK for NodeJS is available from NPM:

```bash
yarn add @picovoice/picovoice-node
```

(or)

```bash
npm install @picovoice/picovoice-node
```

The SDK provides the `Picovoice` class. Create an instance of this class using a Porcupine keyword (with `.ppn` suffix)
and Rhino context file (with `.rhn` suffix), as well as callback functions that will be invoked on wake word detection
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
[Picovoice Nuget package](https://www.nuget.org/packages/Picovoice/) in Visual Studio or using the .NET CLI.

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
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` suffix). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `handle.SampleRate`. Expected number of audio samples per
frame is `handle.FrameLength`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

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

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in the file located at
`keywordPath`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `contextPath`. `keywordPath` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` suffix). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `handle.getSampleRate()`. Expected number of audio samples per
frame is `handle.getFrameLength()`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

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

### Android

There are two possibilities for integrating Picovoice into an Android application.

## High-Level API

[PicovoiceManager](/sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/PicovoiceManager.java) provides
a high-level API for integrating Picovoice into Android applications. It manages all activities related to creating an
input audio stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and
inference completion. The class can be initialized as follow

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

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating number within
[0, 1]. A higher sensitivity reduces miss rate at cost of increased false alarm rate.

When initialized, input audio can be processed using 

```java
manager.start();
```

Stop the manager by

```java
manager.stop();
```

When done be sure to release resources using

```java
manager.delete();
```

## Low-Level API

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

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating number within
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
for releasing native resources.

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

## Releases

### v1.0.0 - October 22, 2020

- Initial release.

## FAQ

You can find the FAQ [here](https://picovoice.ai/docs/faq/picovoice/).
