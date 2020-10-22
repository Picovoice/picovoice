# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is the end-to-end platform for building voice products on your terms. Unlike Alexa and Google services,
Picovoice runs entirely on-device while being more accurate. Using Picovoice, one can infer a user’s intent from a
naturally spoken utterance such as:

> "Hey Edison, set the lights in the living room to blue."

Picovoice detects the occurrence of the custom wake word ("Hey Edison"), and then extracts the intent from the follow-on
spoken command:

```json
{
  "intent": "changeLightColor",
  "slots": {
    "location": "living room",
    "color": "blue"
  }
}
```

## Why Picovoice?

- **Private & Secure:** Everything is processed offline. Intrinsically private; HIPAA and GDPR compliant.
- **Accurate:** Resilient to noise and reverberation. Outperforms cloud-based alternatives by wide margins.
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.
- **Self-Service:** Design, train, and test voice interfaces instantly in your browser, using Picovoice Console.
- **Reliable:** Runs locally without needing continuous connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.

## Table of Contents
- [Picovoice](#picovoice)
  - [Why Picovoice?](#why-picovoice)
  - [Table of Contents](#table-of-contents)
  - [Performance](#performance)
  - [Demos](#demos)
    - [NodeJS Demos](#nodejs-demos)
    - [Python Demos](#python-demos)
    - [.NET Demos](#net-demos)
    - [Java Demos](#java-demos)
    - [Android Demos](#android-demos)
    - [iOS Demos](#ios-demos)
  - [SDKs](#sdks)
      - [NodeJS](#nodejs)
      - [Python](#python)
      - [.NET](#net)
      - [Java](#java)
      - [Android](#android)
      - [iOS](#ios)
  - [Releases](#releases)

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

## Demos

If using SSH, clone the repository with:


```bash
git clone --recurse-submodules git@github.com:Picovoice/picovoice.git
```

If using HTTPS, then type

```bash
git clone --recurse-submodules https://github.com/Picovoice/picovoice.git
```

### NodeJS Demos

We have provided an NPM package with file-based and microphone Picovoice demos. You can do a global NPM install to make
the `pv-file-demo` and `pv-mic-demo` commands available.

```bash
npm install -g @picovoice/picovoice-node-demo
```

```bash
pv-file-demo --help
pv-mic-demo --help
```

The file demo will allow you to test Picovoice against a WAV file that meets the audio processing requirements. The
microphone demo requires you to setup dependencies that are **not included with NPM**. Please see the
[demo instructions](./demo/nodejs) for details.

### Python Demos

Install [PyAudio](https://people.csail.mit.edu/hubert/pyaudio/) and then the demo package

```bash
sudo pip3 install picovoicedemo
```

Check usage information

```bash
picovoice_demo_mic --help
picovoice_demo_file --help
```

The microphone demo opens an audio stream from a microphone, detected utterances of a given wake phrase, and infers
intent from the follow-on spoken command. The file demo is useful for processing prerecorded audio file(s). After
pressing the start button say:

> Porcupine, set the lights in the living room to purple.

### .NET Demos

Install [OpenAL](https://openal.org/) before using the demo.

In the demo project directory and with a working microphone connected to your device, run the following in the terminal:

```bash
dotnet run -c MicDemo.Release -- \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

This demo opens an audio stream from a microphone and detects utterances of a given wake word and commands within a given context. The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file located at `${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the 
follow-on spoken command using the context defined by the file located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

In order to process audio files (e.g. WAV) for keywords and commands run:

```bash
dotnet run -c FileDemo.Release -- \
--input_audio_path ${PATH_TO_INPUT_AUDIO_FILE} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

For more information about .NET demos go to [demo/dotnet](/demo/dotnet).

### Java Demos

In the demo bin directory and with a working microphone connected to your device, run the following in the terminal:

```bash
java -jar picovoice-mic-demo.jar \
-k ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
-c ${PATH_TO_RHINO_CONTEXT_FILE}
```

This demo opens an audio stream from a microphone and detects utterances of a given wake word and commands within a given context. The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file located at `${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the 
follow-on spoken command using the context defined by the file located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

In order to process audio files (e.g. WAV) for keywords and commands run:

```bash
java -jar picovoice-file-demo.jar \
-i ${PATH_TO_INPUT_AUDIO_FILE} \
-k ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
-c ${PATH_TO_RHINO_CONTEXT_FILE}
```

For more information about the Java demos go to [demo/java](/demo/java).

### Android Demos

Using Android Studio, open [demo/android/Activity](/demo/android/Activity) as an Android project and then run the
application. Press the start button and say

> Porcupine, turn of the lights in the kitchen.

For the full set of commands supported in the context refer to [demo's readme](/demo/android/README.md).

### iOS Demos

Using Xcode, open [demo/ios/PicovoiceDemo/PicovoiceDemo.xcodeproj](/demo/ios/PicovoiceDemo/PicovoiceDemo.xcodeproj) and
run the application. Press the start button and say

> Porcupine, make the living room lights brighter.

For the full set of commands supported in the context refer to [demo's readme](/demo/android/README.md).

## SDKs

### NodeJS

The Picovoice SDK for NodeJS is available from NPM:

```bash
yarn add @picovoice/picovoice-node
```

(or)

```bash
npm install @picovoice/picovoice-node
```

The SDK provides the `Picovoice` class. Create an instance of this class using a Porcupine keyword and Rhino context
file, as well as callback functions that will be invoked on wake word and inference events, respectively:

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

As the audio is processed through the Picovoice engines, the callbacks will fire. This is the output when we provide the
built-in "picovoice" keyword and [sample "coffee maker" context](./resources/rhino/resources/contexts) to the Picovoice
class, and then provide it a [test WAV file](./resources/audio_samples/picovoice-coffee.wav) that contains the following
utterance:

> Picovoice, make me a large coffee

```bash
Wake word detected

Inference:
{
    "isUnderstood": true,
    "intent": "orderDrink",
    "slots": {
        "size": "large",
        "coffeeDrink": "coffee"
    }
}
```

### Python

Install the package

```bash
pip3 install picovoice
```

Create a new instance of Picovoice runtime engine

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
frame is `handle.frame_length`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

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

### .NET

You can install the latest version of Picovoice by adding the latest [Picovoice Nuget package](https://www.nuget.org/packages/Picovoice/) in Visual Studio or using the .NET CLI.

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
immediately after use, wrap it in a using statement: 

```csharp
using(Picovoice handle = new Picovoice(keywordPath, wakeWordCallback, contextPath, inferenceCallback))
{
    // .. Picovoice usage here
}
```

### Java

You can add the Picovoice Java SDK by downloading and referencing the latest [Picovoice JAR](/binding/java/bin/).

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

The binding class can be initialized as follow

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
[0, 1]. A higher sensitivity reduces miss rate at cost of increased false alarm rate. When initialized, input audio can
be processed using `manager.start()` and then stopped by `manager.stop()`. When done be sure to release resources using
`manager.delete()`.

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
