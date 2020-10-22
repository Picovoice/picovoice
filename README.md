# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [\*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Table of Contents

- [Picovoice](#picovoice)
  - [Table of Contents](#table-of-contents)
  - [Demos](#demos)
    - [Python Demos](#python-demos)
    - [.NET Demos](#net-demos)
  - [SDKs](#sdks)
    - [Python](#python)
    - [.NET](#net)
  - [Releases](#releases)

## Demos

### NodeJS

We have provided an NPM package with file-based and microphone Picovoice demos. You can do a global NPM install to make the `pv-file-demo` and `pv-mic-demo` commands available.

```bash
npm install -g @picovoice/picovoice-node-demo
```

```
pv-file-demo --help
pv-mic-demo --help
```

The file demo will allow you to test Picovoice against a WAV file that meets the audio processing requirements. The microphone demo requires you to setup dependencies that are **not included with NPM**. Please see the [demo instructions](./demo/nodejs/) for details.

### Python Demos

### .NET Demos

Install [OpenAL](https://openal.org/) before using the demo.

With a working microphone connected to your device run the following in the terminal:

```bash
dotnet run -c MicDemo.Release -- \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

This demo opens an audio stream from a microphone and detects utterances of a given wake word and commands within a given context. The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file located at `${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the 
spoken command using the context defined by the file located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

In order to process audio files (e.g. WAV) for keywords and commands run:

```bash
dotnet run -c FileDemo.Release -- \
--input_audio_path ${PATH_TO_INPUT_AUDIO_FILE} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

For more information about .NET demos go to [demo/dotnet](/demo/dotnet).

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

The SDK provides the `Picovoice` class. Create an instance of this class using a Porcupine keyword and Rhino context file, as well as callback functions that will be invoked on wake word and inference events, respectively:

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

The `keywordArgument` can either be a path to a Porcupine keyword file (.ppn), or one of the built-in keywords (integer enums). The `contextPath` is the path to the Rhino context file (.rhn).

Upon constructing the Picovoice class, send it frames of audio via its `process` method. Internally, Picovoice will switch between wake word detection and inference. The Picovoice class includes `frameLength` and `sampleRate` properties for the format of audio required.

```javascript
// process audio frames that match the Picovoice requirements (16-bit linear pcm audio, single-channel)
while (true) {
  handle.process(frame);
}
```

As the audio is processed through the Picovoice engines, the callbacks will fire. This is the output when we provide the built-in "picovoice" keyword and [sample "coffee maker" context](./resources/rhino/resources/contexts/) to the Picovoice class, and then provide it a [test WAV file](./resources/audio_samples/picovoice-coffee.wav) that contains the following utterance:

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

### .NET

You can install the latest version of Picovoice by adding the latest [Picovoice Nuget package](https://www.nuget.org/packages/Picovoice/) in Visual Studio or using the .NET CLI.

```bash
dotnet add package Picovoice
```

Create an instance of the engine

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

## Releases

### v1.0.0 - October 6, 2020

- Initial release.
