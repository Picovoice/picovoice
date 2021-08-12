# Picovoice Rust Demos

This Rust module contains demos for processing real-time audio (i.e. microphone) and audio files using the Picovoice Platform.

## Installation

MicDemo uses [miniaudio-rs](https://github.com/ExPixel/miniaudio-rs) for cross-platform audio capture. It uses `bindgen` and therefore requires `clang` to be installed and on the path. Use the [`Bindgen` docs](https://rust-lang.github.io/rust-bindgen/requirements.html) for instructions on how to install `clang` for various Operating Systems and distros.

## Usage

NOTE: The working directory for the following `Cargo` commands is:

```console
rhino/demo/rust/filedemo  # File Demo
rhino/demo/rust/micdemo  # Mic Demo
```

### File Demo

It allows testing Picovoice on a corpus of audio files. The demo is mainly useful for quantitative performance benchmarking. It accepts 16kHz audio files. Picovoice processes a single-channel audio stream if a stereo file is
provided it only processes the first (left) channel. The following processes a file looking for instances of the wake phrase defined in the file passed to the `--keyword_path` argument and then infers the follow-on spoken command
using the context defined by the file passed to the `--context_path` argument:

```console
cargo run --release -- \
--input_audio_path "path/to/input.wav" \
--keyword_path "/path/to/keyword.ppn" \
--context_path "/path/to/context.rhn"
```

To see all available arguments, use the `--help` flag:
```console
cargo run --release -- --help
```

### Microphone Demo

It opens an audio stream from a microphone and detects utterances of a give wake word(s). The following processes
incoming audio from the microphone for instances of the wake phrase defined in the file  passed to the `--keyword_path` argument and then infers the follow-on spoken command using the context defined by the file
passed to the `--context_path` argument. Upon completion of the spoken command inference it resumes wake word
detection.

```console
cargo run --release -- \
--keyword_path "/path/to/keyword.ppn" \
--context_path "/path/to/context.rhn"
```

To see all available arguments, use the `-h` flag:
```console
cargo run --release -- --help
```

It is possible that the default audio input device is not the one you wish to use. There are a couple
of debugging facilities baked into the demo application to solve this. First, type the following into the console:
```console
cargo run --release -- --show_audio_devices
```

It provides information about various audio input devices on the box. On a is an example output from a Windows machine:

```console
Capture Devices
    0: Microphone Array (Realtek(R) Audio)
    1: Microphone (USB Audio Device)
``` 

You can use the device index to specify which microphone to use for the demo. For instance, if you want to use the USB microphone in the above example, you can invoke the demo application as below:

```console
cargo run --release -- \
--keyword_path "/path/to/keyword.ppn" \
--context_path "/path/to/context.rhn" \
--audio_device_index 1
```

Exact system setups don't always play well with certain audio backends. If this is the case you can override the default with a specific backend:

```console
cargo run --release -- \
--keyword_path "/path/to/keyword.ppn" \
--context_path "/path/to/context/one.rhn" \
--audio_device_index 1 \
--audio_backend Alsa
```

If the problem persists we suggest storing the recorded audio into a file for inspection. This can be achieved with:

```console
cargo run --release \
--context_path "/path/to/context.rhn" \
--keyword_path "/path/to/keyword.ppn" \
--audio_device_index 1 \
--output_path ./test.wav
```

If after listening to stored file there is no apparent problem detected please open an issue.
