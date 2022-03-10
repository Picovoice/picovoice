# picovoice-web

The Picovoice SDK library for web browsers, powered by WebAssembly. Intended (but not required) to be used with the [@picovoice/web-voice-processor](https://www.npmjs.com/package/@picovoice/web-voice-processor).

Looking for Picovoice SDK for NodeJS? See the [@picovoice/picovoice-node](https://www.npmjs.com/package/@picovoice/picovoice-node) package.

Using Picovoice with Angular, React, or Vue? There are framework-specific libraries available:

- [@picovoice/picovoice-web-angular](https://www.npmjs.com/package/@picovoice/picovoice-web-angular)
- [@picovoice/picovoice-web-react](https://www.npmjs.com/package/@picovoice/picovoice-web-react)
- [@picovoice/picovoice-web-vue](https://www.npmjs.com/package/@picovoice/picovoice-web-vue)

## Introduction

This library provides a unified wake word and follow-on naturally spoken command engine in-browser, offline. This allows a complete Voice AI interaction loop, such as the following:

> "Picovoice, set a timer for two minutes"

Where "Picovoice" is the wake word to start the interaction, and the follow-on command is processed and directly converted from speech into structured data:

```json
{
  "isUnderstood": true,
  "intent": "setTimer",
  "slots": {
    "minutes": "2"
  }
}
```

The follow-on natural commands are domain-specific. In this example, a clock. It will only understand what you program it to understand, resulting in dramatic efficiency and accuracy improvements over generic Speech-to-Text approaches:

> "Picovoice, tell me a joke"

```json
{
  "isUnderstood": false
}
```

All processing is done via WebAssembly and Workers in a separate thread. Speech results are converted into inference directly, without intermediate Speech-to-Text.

Underneath, Picovoice SDK wake word and inference detection is powered by the [Porcupine](https://picovoice.ai/platform/porcupine/) and [Rhino](https://picovoice.ai/platform/porcupine/) engines, respectively. If you wish to use those engines individually, you can use the npm packages specific to them.

## Compatibility

- Chrome / Edge
- Firefox
- Safari

This library requires several modern browser features: WebAssembly, Web Workers, and promises. Internet Explorer will _not_ work.

If you are using this library with the [@picovoice/web-voice-processor](https://www.npmjs.com/package/@picovoice/web-voice-processor) to access the microphone, that requires some additional browser features like Web Audio API. Its overall browser support is approximately the same.

## Packages / Installation

The Picovoice SDK for Web is split into multiple packages due to each language including the entire Voice AI model which is of nontrivial size. There are separate worker and factory packages as well, due to the complexities with bundling an "all-in-one" web workers without bloating bundle sizes. Import each as required.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret. 
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

### Workers

- @picovoice/picovoice-web-de-worker
- @picovoice/picovoice-web-en-worker
- @picovoice/picovoice-web-es-worker
- @picovoice/picovoice-web-fr-worker

### Factories

- @picovoice/picovoice-web-de-factory
- @picovoice/picovoice-web-en-factory
- @picovoice/picovoice-web-es-factory
- @picovoice/picovoice-web-fr-factory

### Worker

For typical cases, use the worker packages. These are compatible with the framework packages for Angular, React, and Vue. The workers are complete with everything you need to run Picovoice off the main thread.

If you are using the workers with the Angular/React/Vue packages, you will load them and pass them into those services/hooks/components as an argument (see the [@picovoice/picovoice-web-angular](https://www.npmjs.com/package/@picovoice/picovoice-web-angular) and [@picovoice/picovoice-web-react](https://www.npmjs.com/package/@picovoice/picovoice-web-react) packages for instructions).

To obtain a Picovoice Worker, we can use the async `create` factory method from the PicovoiceWorkerFactory. Here is a complete example that:

1. Obtains a Worker from the PicovoiceWorkerFactory (in this case, English) to listen for the built-in "Blueberry" wake word and then switch to handle follow-on commands in a domain of interest
1. Responds to keyword/inferenence detection by setting the worker's `onmessage` event handler
1. Starts up the `WebVoiceProcessor` to forward microphone audio to the Picovoice Worker

e.g.:

```console
yarn add @picovoice/web-voice-processor @picovoice/picovoice-web-en-worker
```

```javascript
import { WebVoiceProcessor } from "@picovoice/web-voice-processor"
import { PicovoiceWorkerFactory } from "@picovoice/picovoice-web-en-worker";

const ACCESS_KEY = /* AccessKey obtained from Picovoice Console (https://picovoice.ai/console/) */
const RHINO_CONTEXT_BASE64 = /* Base64 string of the .rhn file for wasm platform, omitted for brevity */

async startPicovoice() {
  // Create a Picovoice Worker (English language) to listen for the built-in wake-word "Blueberry"
  // and commands in the context (a `.rhn` file encoded as base64, omitted for brevity). 
  //
  // Note: you receive a Worker object, _not_ an individual Picovoice engine instance
  // Workers are communicated with via message passing/receiving functions postMessage/onmessage.
  // See https://developer.mozilla.org/en-US/docs/Web/API/Worker for more details.
  const pvWorker = await PicovoiceWorkerFactory.create({
    accessKey: ACCESS_KEY,
    porcupineKeyword: {builtin: "Blueberry"},
    rhinoContext: {base64: RHINO_CONTEXT_BASE64},
    start: false
  });

  // The worker will send a message with data.command = "rhn-inference" upon inference event
  // or data.command = "ppn-keyword" on wake word events
  // Here, we tell it to log it to the console
  pvWorker.onmessage = (msg) => {
    switch (msg.data.command) {
      case 'ppn-keyword':
        // Porcupine keyword detection
        // Subsequent frames of audio will now be forwarded to Rhino for follow-on command inference
        console.log("Wake word detected: " + msg.data.keywordLabel);
        break;
      case 'rhn-inference':
        // Rhino inference detection
        console.log("Inference: " + msg.data.inference);
        break;
      default:
        break;
    }
  };

  // Start up the web voice processor. It will request microphone permission
  // and immediately (start: true) start listening.
  // It downsamples the audio to voice recognition standard format (16-bit 16kHz linear PCM, single-channel)
  // The incoming microphone audio frames will then be forwarded to the Picovoice Worker
  // n.b. This promise will reject if the user refuses permission! Make sure you handle that possibility.
  const webVp = await WebVoiceProcessor.init({
    engines: [pvWorker],
    start: true,
  });
}

startPicovoice()

...

// Finished with Picovoice? Release the WebVoiceProcessor and the worker.
if (done) {
  webVp.release()
  pvWorker.sendMessage({command: "release"})
}
```

**Important Note**: Because the workers are all-in-one packages that run an entire machine learning inference model in WebAssembly, they are approximately 4-6MB in size. While this  tiny for a speech recognition model, it's large for web delivery. Because of this, you likely will want to use dynamic `import()` instead of static `import {}` to reduce your app's starting bundle size. See e.g. https://webpack.js.org/guides/code-splitting/ for more information.

### Factory

If you wish to not use workers at all, use the factory packages. This will let you instantiate Picovoice engine instances directly. Use the `Picovoice.create()` async factory method to create Picovoice instances.

#### Usage

The audio passed to the engine must be of the correct format (16-bit 16kHz linear PCM, single channel). The WebVoiceProcessor handles downsampling in the examples above. If you are not using that, you must ensure you do it yourself.

Provide Picovoice with callback functions for wake word (`porcupineCallback`) and inference (`rhinoCallback`) events.

E.g.:

```javascript
import { Picovoice } from '@picovoice/picovoice-web-en-factory';

const ACCESS_KEY = /* AccessKey obtained from Picovoice Console (https://picovoice.ai/console/) */
const RHINO_CONTEXT_BASE64 = /* Base64 string of the .rhn file for wasm platform */

  async function startPicovoice() {
    const handle = await Picovoice.create({
      accessKey: ACCESS_KEY,
      porcupineKeyword: { builtin: "Blueberry" },
      rhinoContext: RHINO_CONTEXT_BASE64,
      porcupineCallback: (keyword) => {console.log("Wake word detected: " + keyword)},
      rhinoCallback: (inference) => {console.log("Inference: " + inference)}
    });

    // Send Picovoice frames of audio (check handle.frameLength for size of array)
    const audioFrames = new Int16Array(/* Provide data with correct format and size */);
    // Callbacks will be triggered on keyword/inference events as audio is processed
    handle.process(audioFrames);
  };

startPicovoice();
```

**Important Note**: Because the factories are all-in-one packages that run an entire machine learning inference model in WebAssembly, they are approximately 4-6MB in size. While this is tiny for a speech recognition, it's nontrivial for web delivery. Because of this, you likely will want to use dynamic `import()` instead of static `import {}` to reduce your app's starting bundle size. See e.g. https://webpack.js.org/guides/code-splitting/ for more information.

## Build from source (IIFE + ESM outputs)

This library uses Rollup and TypeScript along with Babel and other popular rollup plugins. There are two outputs: an IIFE version intended for script tags / CDN usage, and an ESM version intended for use with modern JavaScript/TypeScript development (e.g. Create React App, Webpack).

```console
yarn
yarn build
```

The output will appear in the ./dist/ folder.
