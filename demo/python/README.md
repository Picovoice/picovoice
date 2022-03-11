# Picovoice Demos

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

This package contains demos and commandline utilities for processing real-time audio (i.e. microphone) and audio files
using Picovoice platform.

## Picovoice

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

* Python 3.5+
* Runs on Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64), Raspberry Pi (all variants), NVIDIA Jetson (Nano), and BeagleBone.

## Installation

```console
sudo pip3 install picovoicedemo
```

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

### File Demo

It allows testing Picovoice on a corpus of audio files. The demo is mainly useful for quantitative performance
benchmarking. It accepts 16kHz audio files. Picovoice processes a single-channel audio stream if a stereo file is
provided it only processes the first (left) channel. The following processes a file looking for instances of the wake 
phrase defined in the file located at `${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the follow-on spoken command
using the context defined by the file located at `${PATH_TO_RHINO_CONTEXT_FILE)}`:

```console
picovoice_demo_file \
--access_key ${ACCESS_KEY} \
--input_audio_path ${PATH_TO_INPUT_AUDIO_FILE} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

### Mic Demo

It opens an audio stream from a microphone and detects utterances of a give wake word(s). The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file located at
`${PATH_TO_PORCUPINE_KEYWORD_FILE}` and then infers the follow-on spoken command using the context defined by the file
located at `${PATH_TO_RHINO_CONTEXT_FILE)}`. Upon completion of the spoken command inference it resumes wake word
detection.

```console
picovoice_demo_mic \
--access_key ${ACCESS_KEY} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

It is possible that the default audio input device recognized by the demo is not the one being used. There are a couple of
debugging facilities baked into the demo application to solve this. First, type the following into the console:

```console
picovoice_demo_mic --show_audio_devices
```

It provides information about various audio input devices on the box. On a Linux box, this is the console output

```
index: 0, device name: USB Audio Device
index: 1, device name: MacBook Air Microphone
``` 

You can use the device index to specify which microphone to use for the demo. For instance, if you want to use the 
USB Audio Device in the above example, you can invoke the demo application as below:

```console
picovoice_demo_mic \
--access_key ${ACCESS_KEY} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)} \
--audio_device_index 0
```

If the problem persists we suggest storing the recorded audio into a file for inspection. This can be achieved by

```console
picovoice_demo_mic \
--access_key ${ACCESS_KEY} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)} \
--audio_device_index 0 \
--output_path ~/test.wav
```

If after listening to stored file there is no apparent problem detected please open an issue.
