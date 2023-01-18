# C Demos

## Compatibility

You need a C99-compatible compiler to build these demos.

## Requirements
- The demo requires [CMake](https://cmake.org/) version 3.13 or higher.
- **For Windows Only**: [MinGW](https://www.mingw-w64.org/) is required to build the demo.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Build Linux/MacOS

```console
cmake -S demo/c/. -B demo/c/build && cmake --build demo/c/build --target picovoice_demo_mic
```

## Build Windows

```console
cmake -S demo/c/. -B demo/c/build -G "MinGW Makefiles" && cmake --build demo/c/build --target picovoice_demo_mic
```

## Run

### Usage

Running the executable without any commandline arguments prints the usage info to the console.

#### Linux, macOS, Raspberry Pi, BeagleBone, Jetson

```console
./demo/c/build/picovoice_demo_mic
usage : ./demo/c/build/picovoice_demo_mic -l LIBRARY_PATH -a ACCESS_KEY -k KEYWORD_PATH -c CONTEXT_PATH
                                          -p PPN_MODEL_PATH -r RHN_MODEL_PATH [--audio_device_index AUDIO_DEVICE_INDEX
                                          --porcupine_sensitivity PPN_SENSITIVITY --rhino_sensitivity RHN_SENSITIVITY
                                          --endpoint_duration_sec --require_endpoint "true"|"false" ]
        ./demo/c/build/picovoice_demo_mic --show_audio_devices
```

#### Windows

```console
.\\demo\\c\\build\\picovoice_demo_mic.exe
usage : .\\demo\\c\\build\\picovoice_demo_mic.exe -l LIBRARY_PATH -a ACCESS_KEY -k KEYWORD_PATH -c CONTEXT_PATH
                                                  -p PPN_MODEL_PATH -r RHN_MODEL_PATH [--audio_device_index AUDIO_DEVICE_INDEX
                                                  --porcupine_sensitivity PPN_SENSITIVITY --rhino_sensitivity RHN_SENSITIVITY
                                                  --endpoint_duration_sec --require_endpoint "true"|"false" ]
        .\\demo\\c\\build\\picovoice_demo_mic.exe --show_audio_devices
```

### Show Audio Devices

The following commands shows the available audio input devices to the console.

#### Linux, macOS, Raspberry Pi, BeagleBone

```console
./demo/c/build/picovoice_demo_mic --show_audio_devices
```

#### Windows

```console
.\\demo\\c\\build\\picovoice_demo_mic.exe --show_audio_devices
```

### Wake Phrase and Follow-on Commands

The following commands start up a microphone audio steam and will wait for the "Picovoice" wake word phrase.
Replace `$-i {AUDIO_DEVICE_INDEX}` with the index of the audio device.

#### Linux

```console
./demo/c/build/picovoice_demo_mic \
-a ${ACCESS_KEY}
-l sdk/c/lib/linux/x86_64/libpicovoice.so \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/linux/picovoice_linux.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/linux/smart_lighting_linux.rhn \
-i {AUDIO_DEVICE_INDEX}
```
#### macOS

```console
./demo/c/build/picovoice_demo_mic \
-a ${ACCESS_KEY}
-l sdk/c/lib/mac/x86_64/libpicovoice.dylib \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/mac/picovoice_mac.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn \
-i {AUDIO_DEVICE_INDEX}
```

#### Raspberry Pi

Replace `${PROCESSOR}` with one of the Raspberry Pi processors defined [here](../../sdk/c/lib/raspberry-pi)
(e.g., for Raspberry Pi 4 this would be "cortex-a72") and run:

```console
./demo/c/build/picovoice_demo_mic \
-a ${ACCESS_KEY}
-l sdk/c/lib/raspberry-pi/${PROCESSOR}/libpicovoice.so \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/raspberry-pi/picovoice_raspberry-pi.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/raspberry-pi/smart_lighting_raspberry-pi.rhn \
-i {AUDIO_DEVICE_INDEX}
```

#### BeagleBone

```console
./demo/c/build/picovoice_demo_mic \
-a ${ACCESS_KEY}
-l sdk/c/lib/beaglebone/libpicovoice.so \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/beaglebone/picovoice_beaglebone.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/beaglebone/smart_lighting_beaglebone.rhn \
-i {AUDIO_DEVICE_INDEX}
```

#### Windows

```console
.\\demo\\c\\build\\picovoice_demo_mic.exe -a ${ACCESS_KEY} -l sdk/c/lib/windows/amd64/libpicovoice.dll -p resources/porcupine/lib/common/porcupine_params.pv -k resources/porcupine/resources/keyword_files/windows/picovoice_windows.ppn 0.5 -r resources/rhino/lib/common/rhino_params.pv -c resources/rhino/resources/contexts/windows/smart_lighting_windows.rhn 0.5 -i {AUDIO_DEVICE_INDEX}
```

Once the wake word is detected, the following will print:

> [wake word]

Then it will infer follow-on commands within the context of smart lighting system. For example, you can say:

> "Turn on the lights."

If understood correctly, the following prints to the console:

```
{
    is_understood : 'true',
    intent : 'changeLightState',
    slots : {
        'state' : 'on',
    }
}
```

# File Demo

## Build

```console
cmake -S demo/c/. -B demo/c/build && cmake --build demo/c/build --target picovoice_demo_file
```

## Run

### Usage

Running the executable without any commandline arguments prints the usage info to the console.

#### Linux, macOS, Raspberry Pi, BeagleBone

```console
./demo/c/build/picovoice_demo_file
usage : ./demo/c/picovoice_demo_file -l LIBRARY_PATH -a ACCESS_KEY -k KEYWORD_PATH -c CONTEXT_PATH -w WAV_PATH
                                     -p PPN_MODEL_PATH -r RHN_MODEL_PATH [--porcupine_sensitivity PPN_SENSITIVITY
                                     --rhino_sensitivity RHN_SENSITIVITY --endpoint_duration_sec --require_endpoint "true"|"false" ]
```

#### Windows

```console
.\\demo\\c\\build\\picovoice_demo_file
usage : .\\demo\\c\\build\\picovoice_demo_file -l LIBRARY_PATH -a ACCESS_KEY -k KEYWORD_PATH -c CONTEXT_PATH -w WAV_PATH
                                               -p PPN_MODEL_PATH -r RHN_MODEL_PATH [--porcupine_sensitivity PPN_SENSITIVITY
                                               --rhino_sensitivity RHN_SENSITIVITY --endpoint_duration_sec --require_endpoint "true"|"false" ]
```

### Wake Phrase and Follow-on Commands

**Note that the demo expects a single-channel WAV file with a sampling rate of 16kHz and 16-bit linear PCM encoding. If you
provide a file with incorrect format the demo does not perform any format validation and simply outputs incorrect results.**

The following processes a WAV file under the [audio_samples](../../resources/audio_samples) directory. It detects the wake word
and infers the intent in the context of a coffee maker system.

#### Linux

```console
./demo/c/build/picovoice_demo_file \
-a ${ACCESS_KEY}
-l sdk/c/lib/linux/x86_64/libpicovoice.so \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/linux/picovoice_linux.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/linux/coffee_maker_linux.rhn \
-w resources/audio_samples/picovoice-coffee.wav
```

#### macOS

```console
./demo/c/build/picovoice_demo_file \
-a ${ACCESS_KEY}
-l sdk/c/lib/mac/x86_64/libpicovoice.dylib \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/mac/picovoice_mac.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn \
-w resources/audio_samples/picovoice-coffee.wav
```

#### Raspberry Pi

Replace `${PROCESSOR}` with one of the Raspberry Pi processors defined [here](../../sdk/c/lib/raspberry-pi)
(e.g., for Raspberry Pi 4 this would be "cortex-a72") and run:

```console
./demo/c/build/picovoice_demo_file \
-a ${ACCESS_KEY}
-l sdk/c/lib/raspberry-pi/${PROCESSOR}/libpicovoice.so \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/raspberry-pi/picovoice_raspberry-pi.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/raspberry-pi/coffee_maker_raspberry-pi.rhn \
-w resources/audio_samples/picovoice-coffee.wav
```

#### BeagleBone

```console
./demo/c/build/picovoice_demo_file \
-a ${ACCESS_KEY}
-l sdk/c/lib/beaglebone/libpicovoice.so \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/beaglebone/picovoice_beaglebone.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/beaglebone/coffee_maker_beaglebone.rhn \
-w resources/audio_samples/picovoice-coffee.wav
```

#### Windows

```console
.\\demo\\c\\build\\picovoice_demo_file.exe -a ${ACCESS_KEY} -l sdk/c/lib/windows/amd64/libpicovoice.dll -p resources/porcupine/lib/common/porcupine_params.pv -k resources/porcupine/resources/keyword_files/windows/picovoice_windows.ppn 0.5 -r resources/rhino/lib/common/rhino_params.pv -c resources/rhino/resources/contexts/windows/coffee_maker_windows.rhn 0.5 -w resources/audio_samples/picovoice-coffee.wav
```

The following prints to the console:

```console
[wake word]
{
    is_understood : 'true',
    intent : 'orderBeverage',
    slots : {
        'size' : 'large',
        'beverage' : 'coffee',
    }
}

real time factor : 0.006
```
