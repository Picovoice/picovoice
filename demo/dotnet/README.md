# Picovoice Demos

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

This package contains demos and commandline utilities for processing real-time audio (i.e. microphone) and audio files
using Picovoice platform.

## Picovoice

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

- .NET Core 3.1
- Runs on Linux (x86_64), macOS (x86_64) and Windows (x86_64)

## Installation

Both demos use [Microsoft's .NET Core framework](https://dotnet.microsoft.com/download).

The Microphone Demo uses [OpenAL](https://openal.org/). You must install this before running the demo.  

On Windows, install using the [OpenAL Windows Installer](https://openal.org/downloads/oalinst.zip).

On Linux use apt-get:

```console
sudo apt-get install libopenal-dev
```

On Mac use Brew:

```console
brew install openal-soft
```

Once .NET Core and OpenAL have been installed, you can build with the dotnet CLI:

```console
dotnet build -c MicDemo.Release
dotnet build -c FileDemo.Release
```

## Usage

NOTE: the working directory for all dotnet commands is:

```console
picovoice/demo/dotnet/PicovoiceDemo
```

### File Demo

The file demo uses Picovoice to scan for keywords and commands in an audio file. The demo is mainly useful for quantitative performance benchmarking against a corpus of audio data. 
Picovoice processes a 16kHz, single-channel audio stream. If a stereo file is provided it only processes the first (left) channel. 
The following processes a file looking for instances of the wake phrase defined in the file located at `${PATH_TO_PORCUPINE_KEYWORD_FILE}` and infers spoken commands
using the context defined by the file located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

```console
dotnet run -c FileDemo.Release -- \
--input_audio_path ${PATH_TO_INPUT_AUDIO_FILE} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

### Microphone Demo

This demo opens an audio stream from a microphone and detects utterances of a given wake word and commands within a given context. The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file located at
`${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the follow-on spoken command using the context defined by the file
located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

```console
dotnet run -c MicDemo.Release -- \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

It is possible that the default audio input device recognized by PyAudio is not the one being used. There are a couple
of debugging facilities baked into the demo application to solve this. First, type the following into the console:

```console
dotnet run -c MicDemo.Release -- --show_audio_devices
```

It provides information about various audio input devices on the box. On a Windows PC, this is the output:

```
Available input devices:

    Device 0: Microphone Array (Realtek(R) Au
    Device 1: Microphone Headset USB
``` 

You can use the device index to specify which microphone to use for the demo. For instance, if you want to use the Headset 
microphone in the above example, you can invoke the demo application as below:

```console
dotnet run -c MicDemo.Release -- \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)} \
--audio_device_index 1
```

If the problem persists we suggest storing the recorded audio into a file for inspection. This can be achieved with:

```console
dotnet run -c MicDemo.Release -- \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)} \
--audio_device_index 1
--output_path ./test.wav
```

If after listening to stored file there is no apparent problem detected please open an issue.
