# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

This binding is for running Porcupine on **NodeJS 12+** on the following platforms:

- Linux (x86_64)
- macOS (x86_64)
- Raspberry Pi (2,3,4)

### Web Browsers

This binding is for NodeJS and **does not work in a browser**. Looking to run Porcupine in-browser? Use the [JavaScript WebAssembly](https://github.com/Picovoice/porcupine/tree/master/binding/javascript) binding instead.

### Porcupine and Rhino

The Picovoice SDK for NodeJS is built on top of the Porcupine and Rhino NodeJS bindings. If you wish to use these engines individually for wake word or inference, see the [Porcupine](https://www.npmjs.com/package/@picovoice/porcupine-node) and [Rhino](https://www.npmjs.com/package/@picovoice/rhino-node) NPM packages, respectively.