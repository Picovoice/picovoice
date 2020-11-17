# Picovoice Demos

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

This demo project is a Java command-line app that processes real-time audio (i.e. microphone) and audio files
using Picovoice platform.

## Picovoice

Picovoice is the end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

- Java 11+
- Runs on Linux (x86_64), macOS (x86_64) and Windows (x86_64)

## Installation

You can get the latest Java demo executable JARs [here](/demo/java/bin).

If you wish, you can build the demos from source by opening the project with the [IntelliJ IDE](https://www.jetbrains.com/idea/download/).
Select "Build > Build Project" to build the two demo classes or "Build > Build Artifacts" to create the executable JARs.

## Usage

NOTE: the working directory for all dotnet commands is:

```bash
picovoice/demo/java/bin
```

### File Demo

The file demo uses Picovoice to scan for keywords and commands in an audio file. The demo is mainly useful for quantitative performance benchmarking against a corpus of audio data. 
Picovoice processes a 16kHz, single-channel audio stream. If a stereo file is provided it only processes the first (left) channel. 
The following processes a file looking for instances of the wake phrase defined in the file located at `${PATH_TO_PORCUPINE_KEYWORD_FILE}` 
and then infers the follow-on spoken command using the context defined by the file located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

```bash
java -jar picovoice-file-demo.jar \
-i ${PATH_TO_INPUT_AUDIO_FILE} \
-k ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
-c ${PATH_TO_RHINO_CONTEXT_FILE}
```

### Microphone Demo

This demo opens an audio stream from a microphone and detects utterances of a give wake word(s). The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file located at
`${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the follow-on spoken command using the context defined by the file
located at `${PATH_TO_RHINO_CONTEXT_FILE)}`. Upon completion of the spoken command inference it resumes wake word
detection.

```bash
java -jar picovoice-mic-demo.jar \
-k ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
-c ${PATH_TO_RHINO_CONTEXT_FILE}
```

It is possible that the default audio input device recognized by PyAudio is not the one being used. There are a couple
of debugging facilities baked into the demo application to solve this. First, type the following into the console:

```bash
java -jar picovoice-mic-demo.jar -sd
```

It provides information about various audio input devices on the box. On a Windows PC, this is the output:

```
Available input devices:

    Device 0: Microphone Array (Realtek(R) Au
    Device 1: Microphone Headset USB	
``` 

You can use the device index to specify which microphone to use for the demo. For instance, if you want to use the Headset 
microphone in the above example, you can invoke the demo application as below:

```bash
java -jar picovoice-mic-demo.jar \
-k ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
-c ${PATH_TO_RHINO_CONTEXT_FILE}
-di 1
```

If the problem persists we suggest storing the recorded audio into a file for inspection. This can be achieved with:

```bash
java -jar picovoice-mic-demo.jar \
-k ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
-c ${PATH_TO_RHINO_CONTEXT_FILE)} \
-di 1 \
-o ./test.wav
```

If after listening to stored file there is no apparent problem detected please open an issue.
