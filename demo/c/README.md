# C Demos

## Compatibility

You need a C99-compatible compiler to build these demos.

## Microphone Demo

## Requirements

**For Windows, MingW is required to run the demo.**

The microphone based demo requires [miniaudio](https://github.com/mackron/miniaudio) for accessing microphone audio data.

## Build

### Linux, macOS, Raspberry Pi

```console
gcc -std=c99 -O3 -o demo/c/picovoice_demo_mic -I sdk/c/include demo/c/picovoice_demo_mic.c -ldl -lpthread -lm
```

### Windows

```console
gcc -std=c99 -O3 -o demo/c/picovoice_demo_mic -I sdk/c/include demo/c/picovoice_demo_mic.c
```

## Run

Running the executable without any commandline arguments prints the usage info to the console.

For Linux, macOS, and Raspberry Pi:

```console
./demo/c/picovoice_demo_mic
usage : ./demo/c/picovoice_demo_mic library_path porcupine_model_path keyword_path porcupine_sensitivity \
                                    rhino_model_path context_path rhino_sensitivity input_audio_device
        ./demo/c/picovoice_demo_mic --show_audio_devices
```

on Windows:

```console
./demo/c/picovoice_demo_mic.exe
usage : ./demo/c/picovoice_demo_mic.exe library_path porcupine_model_path keyword_path porcupine_sensitivity \
                                        rhino_model_path context_path rhino_sensitivity input_audio_device
        ./demo/c/picovoice_demo_mic.exe --show_audio_devices
```

To show the available audio input devices, on Linux, macOS, Raspberry Pi run:

```console
./demo/c/picovoice_demo_mic --show_audio_devices
```

on Windows run:

```console
./demo/c/picovoice_demo_mic.exe --show_audio_devices
```

The following commands start up a microphone audio steam and will wait for the `picovoice` wake word phrase.

### Linux

```console
./demo/c/picovoice_demo_mic \
sdk/c/lib/linux/x86_64/libpicovoice.so \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/linux/picovoice_linux.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/linux/smart_lighting_linux.rhn \
0.5 \
{AUDIO_DEVICE_INDEX}
```

### macOS

```console
./demo/c/picovoice_demo_mic \
sdk/c/lib/mac/x86_64/libpicovoice.dylib \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/mac/picovoice_mac.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn \
0.5 \
{AUDIO_DEVICE_INDEX}
```

### RaspberryPi

Replace `${PROCESSOR}` with one of Raspberry Pi's processor defined [here](../../sdk/c/lib/raspberry-pi) (for Raspberry Pi 4 this would
be cortex-a72) and run:

```console
./demo/c/picovoice_demo_mic \
sdk/c/lib/raspberry-pi/${PROCESSOR}/libpicovoice.so \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/raspberry-pi/picovoice_raspberry-pi.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/raspberry-pi/smart_lighting_raspberry-pi.rhn \
0.5 \
{AUDIO_DEVICE_INDEX}
```

### Windows

```console
./demo/c/picovoice_demo_mic.exe \
sdk/c/lib/windows/amd64/libpicovoice.dll \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/windows/picovoice_windows.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/windows/smart_lighting_windows.rhn \
0.5 \
{AUDIO_DEVICE_INDEX}
```

Replace `${AUDIO_DEVICE_INDEX}` with the index of the audio device.  Once the wake word is detected, the following will print:

> [wake word]

Then it will infer follow-on commands within the context of smart lighting system. For example, you can say:

> "turn on the lights."

## File Demo

**Note that the demo expect a single-channel WAV file with a sampling rate of 16000 and 16-bit linear PCM encoding. If you
provide a file with incorrect format the demo does not perform any format validation and simply outputs incorrect result.**

Compile by executing the following command from the root of the repository:

```console
gcc -std=c99 -O3 -o demo/c/picovoice_demo_file -I sdk/c/include demo/c/picovoice_demo_file.c -ldl
```
Running the executable without any commandline arguments prints the usage info to the console as below:

```console
$ ./demo/c/picovoice_demo_file
usage : ./demo/c/picovoice_demo_file library_path porcupine_model_path keyword_path porcupine_sensitivity \
                                     rhino_model_path context_path rhino_sensitivity wav_path
```

For example the following processes one of the WAV files under resources folder on  an Ubuntu 18.04:

```console
./demo/c/picovoice_demo_file \
sdk/c/lib/linux/x86_64/libpicovoice.so \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/linux/picovoice_linux.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/linux/coffee_maker_linux.rhn \
0.5 \
resources/audio_samples/picovoice-coffee.wav
```

The following achieves the same on a Raspberry Pi 4:

```console
./demo/c/picovoice_demo_file \
sdk/c/lib/raspberry-pi/cortex-a72/libpicovoice.so \
resources/porcupine/lib/common/porcupine_params.pv \
resources/porcupine/resources/keyword_files/raspberry-pi/picovoice_raspberry-pi.ppn \
0.5 \
resources/rhino/lib/common/rhino_params.pv \
resources/rhino/resources/contexts/raspberry-pi/coffe_maker_raspberry-pi.rhn \
0.5 \
resources/audio_samples/picovoice-coffee.wav
```
