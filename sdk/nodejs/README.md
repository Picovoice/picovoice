# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences similar to Alexa and Google, but it runs entirely on-device. Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [\*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

See the [Picovoice Docs](https://picovoice.ai/docs/quick-start/picovoice-nodejs/) for additional details.

## Compatibility

This binding is for running Picovoice on **NodeJS 12+** on the following platforms:

- Windows (x86_64)
- Linux (x86_64)
- macOS (x86_64, arm64)
- Raspberry Pi (2,3,4)
- NVIDIA Jetson (Nano)
- BeagleBone

### Web Browsers

This binding is for NodeJS and **does not work in a browser**. Looking to run Picovoice in-browser? There are npm packages available for [Web](https://www.npmjs.com/package/@picovoice/picovoice-web), and dedicated packages for [Angular](https://www.npmjs.com/package/@picovoice/picovoice-angular), [React](https://www.npmjs.com/package/@picovoice/picovoice-react), and [Vue](https://www.npmjs.com/package/@picovoice/picovoice-vue).

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Installation

The Picovoice SDK for NodeJS is available from npm:

```console
yarn add @picovoice/picovoice-node
```

(or)

```console
npm install @picovoice/picovoice-node
```

## Usage

The SDK provides the `Picovoice` class. Create an instance of this class using a Porcupine keyword and Rhino context file, as well as callback functions that will be invoked on wake word and inference events, respectively:

```javascript
const Picovoice = require("@picovoice/picovoice-node");

const accessKey = "${ACCESS_KEY}" // Obtained from the Picovoice Console (https://console.picovoice.ai/)

const keywordCallback = function (keyword) {
  console.log(`Wake word detected`);
};

const inferenceCallback = function (inference) {
  console.log("Inference:");
  console.log(JSON.stringify(inference, null, 4));
};

const handle = new Picovoice(
  accessKey,
  keywordArgument,
  keywordCallback,
  contextPath,
  inferenceCallback
);
```

The `keywordArgument` can either be a path to a Porcupine keyword file (.ppn), or one of the built-in keywords (integer enums). The `contextPath` is the path to the Rhino context file (.rhn).

Upon constructing the Picovoice class, send it frames of audio via its `process` method. Internally, Picovoice will switch between wake word detection and inference. The Picovoice class includes `frameLength` and `sampleRate` properties for the format of audio required.

```javascript
// process audio frames that match the Picovoice requirements (16-bit linear pcm audio, single-channel)
while (true) {
  handle.process(frameOfAudio);
}
```

As the audio is processed through the Picovoice engines, the callbacks will fire. This is the output when we provide the built-in "picovoice" keyword and [sample "coffee maker" context](https://github.com/Picovoice/rhino/tree/master/resources/contexts) to the Picovoice class, and then provide it a [test WAV file](../../resources/audio_samples/picovoice-coffee.wav) that contains the following utterance:

> "Picovoice, make me a large coffee"

```console
Wake word detected

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

### Porcupine and Rhino

The Picovoice SDK for NodeJS is built on top of the Porcupine and Rhino NodeJS bindings. If you wish to use these engines individually for wake word or inference, see the [Porcupine](https://www.npmjs.com/package/@picovoice/porcupine-node) and [Rhino](https://www.npmjs.com/package/@picovoice/rhino-node) NPM packages, respectively.
