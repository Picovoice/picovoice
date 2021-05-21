# Picovoice Go Demos

This Go module contains demos for processing real-time audio (i.e. microphone) and audio files using the Picovoice Platform.

## Installation

MicDemo uses [malgo](https://github.com/gen2brain/malgo) for cross-platform audio capture. It requires `cgo`, which on Windows may mean that you need to install a gcc compiler like [Mingw](http://mingw-w64.org/doku.php) to build it properly.

## Usage

NOTE: The working directory for the following go commands is:

```console
cd picovoice/demo/go
```

### File Demo

It allows testing Picovoice on a corpus of audio files. The demo is mainly useful for quantitative performance benchmarking. It accepts 16kHz audio files. Picovoice processes a single-channel audio stream if a stereo file is
provided it only processes the first (left) channel. The following processes a file looking for instances of the wake phrase defined in the file passed to the `-keyword_path` argument and then infers the follow-on spoken command
using the context defined by the file passed to the `-context_path` argument:

```console
go run filedemo/picovoice_file_demo.go \
-input_audio_path "path/to/input.wav" \
-keyword_path "/path/to/keyword.ppn" \
-context_path "/path/to/context.rhn"
```

### Microphone Demo

It opens an audio stream from a microphone and detects utterances of a give wake word(s). The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file  passed to the `-keyword_path` argument and then infers the follow-on spoken command using the context defined by the file
passed to the `-context_path` argument. Upon completion of the spoken command inference it resumes wake word
detection.

```console
go run micdemo/picovoice_mic_demo.go \
-keyword_path "/path/to/keyword.ppn" \
-context_path "/path/to/context.rhn"
```

It is possible that the default audio input device is not the one you wish to use. There are a couple
of debugging facilities baked into the demo application to solve this. First, type the following into the console:
```console
go run micdemo/picovoice_mic_demo.go -show_audio_devices
```

It provides information about various audio input devices on the box. On a is an example output from a Windows machine:

```console
Capture Devices
    0: Microphone Array (Realtek(R) Audio)
    1: Microphone (USB Audio Device)
``` 

You can use the device index to specify which microphone to use for the demo. For instance, if you want to use the USB microphone in the above example, you can invoke the demo application as below:

```console
go run micdemo/picovoice_mic_demo.go \
-keyword_path "/path/to/keyword.ppn" \
-context_path "/path/to/context.rhn" \
-audio_device_index 1
```

If the problem persists we suggest storing the recorded audio into a file for inspection. This can be achieved with:

```console
go run micdemo/picovoice_mic_demo.go \
-context_path "/path/to/context.rhn" \
-keyword_path "/path/to/keyword.ppn" \
-audio_device_index 1 \
-output_path ./test.wav
```

If after listening to stored file there is no apparent problem detected please open an issue.
