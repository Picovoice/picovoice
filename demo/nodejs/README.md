# Picovoice SDK for NodeJS Demos

This package provides two demonstration command-line applications for Picovoice: a file based demo, which scans a compatible WAV file, and a microphone demo.

## Introduction to Picovoice SDK

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [\*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

These demos run Rhino on **NodeJS 10+** on the following platforms:

- Linux (x86_64)
- macOS (x86_64)
- Raspberry Pi (2,3,4)

### Web Browsers

These demos and the bindings upon which they are built are for NodeJS and **do not work in a browser**. Looking to run Picovoice in-browser? Use the [Porcupine JavaScript WebAssembly binding](https://github.com/Picovoice/porcupine/tree/master/binding/javascript) and [Rhino JavaScript WebAssembly binding](https://github.com/Picovoice/rhino/tree/master/binding/javascript) instead. Also see this [tutorial for running Picovoice in-browser](https://picovoice.ai/docs/tutorials/using-picovoice-engines-with-react/).

## Prerequisites

If you only wish to use the file-based demo, you may skip ahead to [installing the NPM package](#install-npm-package).

### Microphone demo

The microphone demo allows you try Rhino by speaking a phrase and seeing the resulting inference. Note: **the microphone demo requires you to install/setup software that is not included by npm**. For microphone access, the [node-record-lpm16](https://www.npmjs.com/package/node-record-lpcm16) package is used. Please follow that documentation for troubleshooting.

The [node-record-lpm16](https://www.npmjs.com/package/node-record-lpcm16) library spawns a different microphone recording process depending on the OS used. The microphone program (SoX or Arecord) must be setup manually and is not included with yarn/npm.

#### Setup SoX / Arecord

##### macOS

See [the documentation for node-record-lpm16](https://www.npmjs.com/package/node-record-lpcm16#dependencies) for instructions on installing [SoX](http://sox.sourceforge.net/).

##### Raspberry Pi

See [this quick start](https://picovoice.ai/quick-start/wake-word-raspberrypi/) for instructions on setting up the microphone / default device.

## Install NPM package

To install the demos and make them available on the command line, use either of the following `yarn` or `npm` commands:

```bash
yarn global add @picovoice/picovoice-node-demo
```

(or)

```bash
npm install -g @picovoice/picovoice-node-demo
```

### Run the mic demo

Here is an example which will understand commands from the "Smart Lighting" demo from the [Rhino GitHub repostiory](https://github.com/Picovoice/rhino/blob/master/resources/contexts/) (note that context files are platform-dependent; choose the appropriate one for the platform you are using; this demo uses the "mac" version)

Using the 'global' install methods above should add `pv-mic-demo` to your system path, which we can use to run the mic demo. Specify the Wake Word (.ppn) with `--keyword_file_path` and the Speech-to-Intent context (.rhn file) with `--context_file_path`.

```bash
pv-mic-demo \
--keyword bumblebee \
--context_file_path ../../resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn
```

You can use custom Wake Word files (.ppn) with `--keyword_file_path`:

```bash
pv-mic-demo \
--keyword_file_path ./hey_edison.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/smart_lighting_mac.rhn
```

The Rhino context source in YAML format will be output to show you the grammar and options that the context supports. First, the demo will listen for the wake word (Porcupine engine). Upon the wake word detection, the demo will switch to follow-on command inference (Rhino engine). The demo will listen for a phrase that the context understands, and upon reaching a conclusion (or timeout), it will output the results.

```bash
Context info:
-------------
context:
  expressions:
    changeColor:
      - (please) [change, set, switch] (the) $location:location (to) $color:color
      - (please) [change, set, switch] (the) $location:location color (to) $color:color
      - (please) [change, set, switch] (the) $location:location lights (to) $color:color
      ... (etc.) ...

Platform: 'mac'; attempting to use 'sox' to access microphone ...
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

```bash
pv-mic-demo --context_file_path ../../resources/contexts/mac/smart_lighting_mac.rhn

...

Platform: 'mac'; attempting to use 'sox' to access microphone ...
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

```bash
pv-file-demo \
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

```bash
pv-mic-demo --help
```

```bash
pv-file-demo --help
```

```bash
Options:
  -k, --keyword_file_path <string>        absolute path(s) to porcupine keyword files (.ppn extension)
  -b, --keyword <string>                  built in keyword(s) (americano,blueberry,bumblebee,grapefruit,grasshopper,picovoice,porcupine,terminator)
  -c, --context_file_path <string>             absolute path to rhino context (.rhn extension)
  -s, --sensitivity <number>              sensitivity value between 0 and 1 (default: 0.5)
  --porcupine_library_file_path <string>  absolute path to porcupine dynamic library
  --porcupine_model_file_path <string>    absolute path to porcupine model
  --rhino_library_file_path <string>      absolute path to rhino dynamic library
  --rhino_model_file_path <string>        absolute path to rhino model
  -h, --help                              display help for command
```

### Sensitivity

The sensitivity is a floating point value in the range [0,1] which specifies the tradeoff between miss rate and false alarm. The demo defaults to 0.5. You can override this with `--sensitivity`:

```bash
pv-mic-demo \
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

```
pv-mic-demo \
--keyword_file_path ../../resources/porcupine/resources/keyword_files/mac/picovoice_mac.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn \
--porcupine_library_file_path ../../resources/porcupine/lib/mac/x86_64/libpv_porcupine.dylib \
--porcupine_model_file_path ../../resources/porcupine/lib/common/porcupine_params.pv
--rhino_library_file_path ../../resources/rhino/lib/mac/x86_64/libpv_rhino.dylib \
--rhino_model_file_path ../../resources/rhino/lib/common/rhino_params.pv
```

## Running the demos from the GitHub repository

From the `demo/nodejs` folder, use one of `yarn` or `npm` to install the package dependencies:

```bash
cd demo/nodejs
yarn
```

(or)

```bash
cd demo/nodejs
npm install
```

### Microphone demo

From the `demo/nodejs` folder, use `yarn mic` (or `npm run mic`) to run the mic demo. For `npm run`, note the extra `--` needed before specifying commands. This is to disambiguate whether the options are intended for npm or for the demo script. As before, pick a context that matches the platform you are using (these examples use 'mac'):

```bash
yarn mic \
--keyword AMERICANO \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn
```

(or)

```bash
npm run mic -- --keyword AMERICANO --context_file_path ../../resources/contexts/mac/coffee_maker_mac.rhn
```

### File demo

From the `demo/nodejs` folder, use `yarn file` or `npm run file`. For `npm run`, note the extra `--` needed before specifying commands. This is to disambiguate whether the options are intended for npm itself, or for the demo script.

```bash
yarn file \
--input_audio_file_path ../../resources/audio_samples/test_within_context.wav \
--keyword_file_path ../../resources/porcupine/resources/keyword_files/mac/terminator_mac.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn
```

(or)

```bash
npm run file -- \
--input_audio_file_path ../../resources/audio_samples/test_within_context.wav \
--keyword_file_path ../../resources/porcupine/resources/keyword_files/mac/terminator_mac.ppn \
--context_file_path ../../resources/rhino/resources/contexts/mac/coffee_maker_mac.rhn
```
