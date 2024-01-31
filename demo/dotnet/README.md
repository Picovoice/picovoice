# Picovoice Demos for .NET

This package contains demos and commandline utilities for processing real-time audio (i.e. microphone) and audio files
using Picovoice platform.

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

## Requirements

- .NET 6.0

## Compatibility

- Linux (x86_64)
- macOS (x86_64)
- Windows (x86_64)
- Raspberry Pi:
  - 2
  - 3 (32 and 64 bit)
  - 4 (32 and 64 bit)
  - 5 (32 and 64 bit)
- NVIDIA Jetson Nano
- BeagleBone

## Installation

Both demos use [Microsoft's .NET Core framework](https://dotnet.microsoft.com/download).

```console
dotnet build -c MicDemo.Release
dotnet build -c FileDemo.Release
```

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

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
--access_key ${ACCESS_KEY}
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE}
```

### Microphone Demo

This demo opens an audio stream from a microphone and detects utterances of a given wake word and commands within a given context. The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file located at
`${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the follow-on spoken command using the context defined by the file
located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

```console
dotnet run -c MicDemo.Release -- \
--access_key ${ACCESS_KEY} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE}
```

It is possible that the default audio input device recognized by PyAudio is not the one being used. There are a couple
of debugging facilities baked into the demo application to solve this. First, type the following into the console:

```console
dotnet run -c MicDemo.Release -- --show_audio_devices
```

It provides information about various audio input devices on the box. This is an example of the output:

```
index: 0, device name: USB Audio Device
index: 1, device name: MacBook Air Microphone
```

You can use the device index to specify which microphone to use for the demo. For instance, if you want to use the USB Audio Device
in the above example, you can invoke the demo application as below:

```console
dotnet run -c MicDemo.Release -- \
--access_key ${ACCESS_KEY} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE} \
--audio_device_index 0
```

If the problem persists we suggest storing the recorded audio into a file for inspection. This can be achieved with:

```console
dotnet run -c MicDemo.Release -- \
--access_key ${ACCESS_KEY} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE} \
--audio_device_index 0
--output_path ./test.wav
```

If after listening to stored file there is no apparent problem detected please open an issue.
