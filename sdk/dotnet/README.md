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


- .NET Standard 2.0, .NET Core 2.0+, .NET Framework 4.6.1+
- Runs on Linux (x86_64), macOS (x86_64) and Windows (x86_64)

## Installation

You can install the latest version of Picovoice by adding the latest [Picovoice Nuget package](https://www.nuget.org/packages/Picovoice/) in Visual Studio or using the .NET CLI.

```bash
dotnet add package Picovoice
```

## Usage

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

## Demos

The [Picovoice dotnet demo](/demo/dotnet) is a .NET Core command line application that allows for 
processing real-time audio (i.e. microphone) and files using Picovoice.