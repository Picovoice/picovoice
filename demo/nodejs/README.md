# Picovoice SDK for NodeJS Demos

This package provides two demonstration command-line applications for Picovoice: a file-based demo, which scans a compatible WAV file, and a microphone demo.

## Introduction to Picovoice SDK

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences similar to Alexa and Google, but it runs entirely on-device. Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [\*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

These demos run Rhino on **NodeJS 12+** on the following platforms:

- Windows (x86_64)
- Linux (x86_64)
- macOS (x86_64, arm64)
- Raspberry Pi (2,3,4)
- NVIDIA Jetson (Nano)
- BeagleBone

### Web Browsers

These demos and the bindings upon which they are built are for NodeJS and **do not work in a browser**. Looking to run Picovoice in-browser? There are npm packages available for [Web](https://www.npmjs.com/package/@picovoice/picovoice-web-en-worker), and dedicated packages for [Angular](https://www.npmjs.com/package/@picovoice/picovoice-web-angular), [React](https://www.npmjs.com/package/@picovoice/picovoice-web-react), and [Vue](https://www.npmjs.com/package/@picovoice/picovoice-web-vue).

## AccessKey

Picovoice requires a valid `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

## Install NPM package

To install the demos and make them available on the command line, use either of the following `yarn` or `npm` commands:

```console
yarn global add @picovoice/picovoice-node-demo
```

(or)

```console
npm install -g @picovoice/picovoice-node-demo
```

### Run the mic demo

Here is an example which will understand commands from the "Smart Lighting" demo from the [Rhino GitHub repostiory](https://github.com/Picovoice/rhino/blob/master/resources/contexts/) (note that context files are platform-dependent; choose the appropriate one for the platform you are using; this demo uses the "mac" version)

Using the 'global' install methods above should add `pv-mic-demo` to your system path, which we can use to run the mic demo. 

Use `pv-mic-demo` to run the mic demo. First select an input audio device to start recording audio and provide your Picovoice AccessKey with `--access_key`.

```console
pv-mic-demo  --access_key ${ACCESS_KEY} --show_audio_devices
```

This command prints a list of the available devices and its inputs:

```console
index: 0, device name: USB Audio Device
index: 1, device name: MacBook Air Microphone
```

Specify the input audio device with `--audio_device_index` (this may be empty if you
wish to use system default microphone). In this example we will use USB Audio Device.  

Specify the Wake Word (.ppn) with `--keyword_file_path` and the Speech-to-Intent context (.rhn file) with `--context_file_path`.

```console
pv-mic-demo \
--access_key ${ACCESS_KEY} \
--audio_device_index 0 \
--keyword bumblebee \
--context_file_path ../../resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn
```

You can use custom Wake Word files (.ppn) with `--keyword_file_path`:

```console
pv-mic-demo \
--access_key ${ACCESS_KEY} \
--audio_device_index 0 \
--keyword_file_path ./hey_edison.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn
```

The Rhino context source in YAML format will be output to show you the grammar and options that the context supports. First, the demo will listen for the wake word (Porcupine engine). Upon the wake word detection, the demo will switch to follow-on command inference (Rhino engine). The demo will listen for a phrase that the context understands, and upon reaching a conclusion (or timeout), it will output the results.

```console
Using device: sof-hda-dsp Digital Microphone...
Context info:
-------------
context:
  expressions:
    changeColor:
      - (please) [change, set, switch] (the) $location:location (to) $color:color
      - (please) [change, set, switch] (the) $location:location color (to) $color:color
      - (please) [change, set, switch] (the) $location:location lights (to) $color:color
      ... (etc.) ...

Listening for speech within the context of 'smart_lighting_mac'. Please speak your phrase into the microphone.

# (say "bumblebee", or the custom Porcupine keyword you chose)

Wake word 'bumblebee' detected

# (say e.g. "please turn on the lights in the kitchen")

...

Inference result:
{
    "isUnderstood": true,
    "intent": "changeLightState",
    "slots": {
        "state": "on",
        "location": "kitchen"
    }
}

```

Now try again, but this time say something that the context is not designed to understand, like "tell me a joke":

```console
pv-mic-demo --access_key ${ACCESS_KEY} --context_file_path ../../resources/contexts/mac/smart_lighting_mac.rhn

...
Listening for speech within the context of 'smart_lighting_mac'. Please speak your phrase into the microphone.

# (say "bumblebee", or the custom Porcupine keyword you chose)

Wake word 'bumblebee' detected

# (say e.g. "tell me a joke")

Inference result:
{
    "isUnderstood": false
}
```

### Run the file demo

The file-based demo allows you to scan a compatible wave file with Rhino. Note: **The demo requires 16KHz, 16-bit linear PCM, single-channel (mono) WAV files**.

To run the file-based demo, we need to provide a Porcupine keyword and Rhino Speech-to-Intent context, along with a path to a compatible WAV file.

We can use the WAV file that are bundled in the [Picovoice GitHub repostiory](https://github.com/Picovoice/picovoice/blob/master/resources/audio_samples/). This is intended to be used with the sample "Coffee Maker" context and the "Picovoice" keyword, also available in the [Picovoice GitHub repostiory](https://github.com/Picovoice/picovoice/blob/master/resources/) (note that keyword and context files are platform-dependent; choose the appropriate one for the platform you are using; this demo uses the "mac" version of each file)

Run the file demo and the successful inference with the intent "orderDrink" along with the specific details are returned:

```console
pv-file-demo \
--access_key ${ACCESS_KEY} \
--input_audio_file_path ../../resources/audio_samples/picovoice-coffee.wav \
--keyword_file_path ../../resources/porcupine/resources/keyword_files/mac/picovoice_mac.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn

...

Wake word 'picovoice' detected
Listening for speech within the context of 'coffee'

Inference:
{
    "isUnderstood": true,
    "intent": "orderDrink",
    "slots": {
        "size": "large",
        "coffeeDrink": "coffee"
    }
}
```

## Common Demo Options

The microphone and file demos both have additional options.

To see the full set of options, use `--help`:

```console
pv-mic-demo --help
```

```console
pv-file-demo --help
```

```console
Options:
  -a, --access_key <string>               AccessKey obtain from the Picovoice Console (https://console.picovoice.ai/)
  -i, --input_audio_file_path <string>    input audio wave file in 16-bit 16KHz linear PCM format (mono)
  -k, --keyword_file_path <string>        absolute path(s) to porcupine keyword files (.ppn extension)
  -b, --keyword <string>                  built in keyword(s) (alexa,americano,blueberry,bumblebee,computer,grapefruit,grasshopper,hey google,hey siri,jarvis,ok
                                          google,picovoice,porcupine,terminator)
  -c, --context_file_path <string>        absolute path to rhino context (.rhn extension)
  -s, --sensitivity <number>              sensitivity value between 0 and 1 (default: 0.5)
  -e, --requires_endpoint                 If set, Rhino requires an endpoint (chunk of silence) before finishing inference
  --porcupine_library_file_path <string>  absolute path to porcupine dynamic library
  --porcupine_model_file_path <string>    absolute path to porcupine model
  --rhino_library_file_path <string>      absolute path to rhino dynamic library
  --rhino_model_file_path <string>        absolute path to rhino model
  -h, --help                              display help for command
```

### Sensitivity

The sensitivity is a floating point value in the range [0,1] which specifies the tradeoff between miss rate and false alarm. The demo defaults to 0.5. You can override this with `--sensitivity`:

```console
pv-mic-demo \
--access_key ${ACCESS_KEY} \
--keyword GRASSHOPPER \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn \
--sensitivity 0.65
```

### Creating custom Wake Word (.ppn) and Speech-to-Intent context (.rhn) files

To create keywords and train into PPN files, and to design Speech-to-Intent contexts and train them into RHN files, see the [Picovoice Console](https://picovoice.ai/console/).

Files generated with the Picovoice Console carry restrictions including (but not limited to): training allowance, time limits, available platforms, and commercial usage.

### Custom library and model files

If desired, you may override the Porcupine and Rhino model and dynamic libraries by specifying their absolute paths with `--porcupine_model_file_path` and `--porcupine_library_file_path`, respectively and the Rhino model and dynamic libraries with `--rhino_model_file_path` and `--rhino_library_file_path`. As with keyword and context files, the dynamic libraries are specific to the platform.

e.g. for macOS (x86_64):

```console
pv-mic-demo \
--access_key ${ACCESS_KEY} \
--keyword_file_path ../../resources/porcupine/resources/keyword_files/mac/picovoice_mac.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn \
--porcupine_library_file_path ../../resources/porcupine/lib/mac/x86_64/libpv_porcupine.dylib \
--porcupine_model_file_path ../../resources/porcupine/lib/common/porcupine_params.pv
--rhino_library_file_path ../../resources/rhino/lib/mac/x86_64/libpv_rhino.dylib \
--rhino_model_file_path ../../resources/rhino/lib/common/rhino_params.pv
```

## Running the demos from the GitHub repository

From the `demo/nodejs` folder, use one of `yarn` or `npm` to install the package dependencies:

```console
cd demo/nodejs
yarn
```

(or)

```console
cd demo/nodejs
npm install
```

### Microphone demo

From the `demo/nodejs` folder, use `yarn mic` (or `npm run mic`) to run the mic demo. For `npm run`, note the extra `--` needed before specifying commands. This is to disambiguate whether the options are intended for npm or for the demo script. As before, pick a context that matches the platform you are using (these examples use 'mac'):

```console
yarn mic \
--access_key ${ACCESS_KEY} \
--keyword AMERICANO \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn
```

(or)

```console
npm run mic --  --access_key ${ACCESS_KEY} --keyword AMERICANO --context_file_path ../../resources/contexts/mac/coffee_maker_mac.rhn
```

### File demo

From the `demo/nodejs` folder, use `yarn file` or `npm run file`. For `npm run`, note the extra `--` needed before specifying commands. This is to disambiguate whether the options are intended for npm itself, or for the demo script.

```console
yarn file \
--access_key ${ACCESS_KEY} \
--input_audio_file_path ../../resources/audio_samples/test_within_context.wav \
--keyword_file_path ../../resources/porcupine/resources/keyword_files/mac/terminator_mac.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn
```

(or)

```console
npm run file -- \
--access_key ${ACCESS_KEY} \
--input_audio_file_path ../../resources/audio_samples/test_within_context.wav \
--keyword_file_path ../../resources/porcupine/resources/keyword_files/mac/terminator_mac.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn
```
