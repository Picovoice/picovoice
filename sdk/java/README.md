# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences similar to Alexa and Google, but it runs entirely on-device.

Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [\*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Requirements

- Java 11+

## Compatibility

- Linux (x86_64)
- macOS (x86_64, arm64)
- Windows (x86_64)
- Raspberry Pi 2, Raspberry Pi 3 (32 and 64 bit), Raspberry Pi 4 (32 and 64 bit)
- Jetson Nano
- BeagleBone

## Installation

The latest Java bindings are available from the Maven Central Repository at:

```console
ai.picovoice:picovoice-java:${version}
```

If you're using Gradle for your Java project, include the following line in your `build.gradle` file to add Picovoice:
```console
implementation 'ai.picovoice:picovoice-java:${version}'
```

If you're using IntelliJ, open the Project Structure dialog (`File > Project Structure`) and go to the `Libraries` section.
Click the plus button at the top to add a new project library and select `From Maven...`. Search for `ai.picovoice:picovoice-java`
in the search box and add the latest version to your project.

## Build

To build from source, invoke the Gradle build task from the command-line:
```console
cd picovoice/sdk/java
./gradlew build
```

Once the task is complete, the output JAR can be found in `picovoice/sdk/java/build/libs`.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

The easiest way to create an instance of the engine is with the Picovoice Builder:

```java
import ai.picovoice.picovoice.*;

String keywordPath = "/absolute/path/to/keyword.ppn"

final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

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
                    .setAccessKey(accessKey)
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

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demos

The [Picovoice Java demo](../../demo/java) is a Java command-line application that allows for
processing real-time audio (i.e. microphone) and files using Picovoice.
