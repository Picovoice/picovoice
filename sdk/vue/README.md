# picovoice-web-vue

Renderless Vue component for Picovoice SDK for Web.

## Picovoice SDK

This library provides a unified wake word and follow-on naturally spoken command engine in-browser, offline. All audio processing occurs in the browser via WebAssembly; no microphone data leaves the device.

The Picovoice SDK enables a complete Voice AI interaction loop, such as the following:

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

The natural commands are domain-specific. In this case, a clock. It will only understand what you program it to understand, resulting in dramatic efficiency and accuracy improvements over generic Speech-to-Text approaches:

> "Picovoice, tell me a joke"

```json
{
  "isUnderstood": false
}
```

This command was outside of the domain and therefore not understood.

All processing is done via WebAssembly and Workers in a separate thread. Speech results are converted into inference directly, without intermediate Speech-to-Text.

Underneath, Picovoice SDK wake word and inference detection is powered by the [Porcupine](https://picovoice.ai/platform/porcupine/) and [Rhino](https://picovoice.ai/platform/porcupine/) engines, respectively. If you wish to use those engines individually, you can use the npm packages specific to them.

## Compatibility

This library is compatible with Vue 3.

The Picovoice SDKs for Web are powered by WebAssembly (WASM), the Web Audio API, and Web Workers.

All modern browsers (Chrome/Edge/Opera, Firefox, Safari) are supported, including on mobile. Internet Explorer is _not_ supported.

Using the Web Audio API requires a secure context (HTTPS connection), with the exception of `localhost`, for local development.

## AccessKey

The Picovoice SDK requires a valid `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

## Installation

Install the package using `npm` or `yarn`. You will also need to add the `@picovoice/web-voice-processor` and one of the `@picovoice/picovoice-web-xx-worker` series of packages for the language-specific model:

E.g. English:

```console
yarn add @picovoice/picovoice-web-vue @picovoice/picovoice-web-en-worker @picovoice/web-voice-processor
```

## Usage

Import the `Picovoice` component from the `@picovoice/picovoice-web-vue` package, and the `PicovoiceWorkerFactory` from a `@picovoice/picovoice-web-xx-worker` package. Bind the worker to `Picovoice` like the demo `.vue` file below:

```html
<Picovoice
  ref="picovoice"
  v-bind:picovoiceFactoryArgs="{
      accessKey: '${ACCESS_KEY}', <!-- AccessKey obtained from Picovoice Console (https://picovoice.ai/console/) -->
      porcupineKeyword: { builtin: Picovoice, sensitivity: 0.6 },
      rhinoContext: {
        base64: RHINO_TRAINED_CONTEXT_BASE_64_STRING
      },
    }"
  v-bind:picovoiceFactory="factory"
  v-on:pv-init="pvInitFn"
  v-on:pv-ready="pvReadyFn"
  v-on:ppn-keyword="pvKeywordFn"
  v-on:rhn-inference="pvInferenceFn"
  v-on:pv-error="pvErrorFn"
/>
```

```javascript
import Picovoice from '@picovoice/picovoice-web-vue';
import { PicovoiceWorkerFactory as PicovoiceWorkerFactoryEn } from '@picovoice/picovoice-web-en-worker';

export default {
  name: 'VoiceWidget',
  components: {
    Picovoice,
  },
  data: function () {
    return {
      inference: null,
      isError: false,
      isLoaded: false,
      isListening: false,
      isTalking: false,
      factory: PicovoiceWorkerFactoryEn,
    };
  },
  methods: {},
};
```

## Events

The Picovoice component will emit the following events:

| Event           | Data                                                                  | Description                                                                                         |
| --------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| "pv-loading"    |                                                                       | Picovoice has begun loading                                                                         |
| "pv-ready"      |                                                                       | Picovoice has finished loading & the user has granted microphone permission: ready to process voice |
| "ppn-keyword"   | The keyword                                                           | Porcupine has detected the keyword ( word, wake up word, hotword).                                  |
| "rhn-inference" | The inference object (see above for examples)                         | Rhino has concluded the inference.                                                                  |
| "pv-error"      | The error that was caught (e.g. "NotAllowedError: Permission denied") | An error occurred while Picovoice or the WebVoiceProcessor was loading                              |
