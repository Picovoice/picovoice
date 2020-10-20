# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [\*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Table of Contents

- [Picovoice](#picovoice)
  - [Table of Contents](#table-of-contents)
  - [Demos](#demos)
    - [Python Demos](#python-demos)
  - [SDKs](#sdks)
    - [Python](#python)
  - [Releases](#releases)

## Demos

### NodeJS

We have provided an NPM package with file-based and microphone Picovoice demos. You can do a global NPM install to make the `pv-file-demo` and `pv-mic-demo` commands available.

```bash
npm install -g @picovoice/picovoice-node-demo
```

```
pv-file-demo --help
pv-mic-demo --help
```

The file demo will allow you to test Picovoice against a WAV file that meets the audio processing requirements. The microphone demo requires you to setup dependencies that are **not included with NPM**. Please see the [demo instructions](./demo/nodejs/) for details.

### Python Demos

## SDKs

### NodeJS

The Picovoice SDK for NodeJS is available from NPM:

```bash
yarn add @picovoice/picovoice-node
```

(or)

```bash
npm install @picovoice/picovoice-node
```

The SDK provides the `Picovoice` class. Create an instance of this class using a Porcupine keyword and Rhino context file, as well as callback functions that will be invoked on wake word and inference events, respectively:

```javascript
const Picovoice = require("@picovoice/picovoice-node");

let keywordCallback = function (keyword) {
  console.log(`Wake word detected`);
};

let inferenceCallback = function (inference) {
  console.log("Inference:");
  console.log(JSON.stringify(inference, null, 4));
};

let handle = new Picovoice(
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
  handle.process(frame);
}
```

As the audio is processed through the Picovoice engines, the callbacks will fire. This is the output when we provide the built-in "picovoice" keyword and [sample "coffee maker" context](./resources/rhino/resources/contexts/) to the Picovoice class, and then provide it a [test WAV file](./resources/audio_samples/picovoice-coffee.wav) that contains the following utterance:

> Picovoice, make me a large coffee

```bash
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

### Python

## Releases

### v1.0.0 - October 6, 2020

- Initial release.
