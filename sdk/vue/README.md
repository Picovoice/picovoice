# picovoice-web-vue

Vue mixin for Picovoice SDK Web.

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

This command was outside the domain and therefore not understood.

All processing is done via WebAssembly and Workers in a separate thread. Speech results are converted into inference directly, without intermediate Speech-to-Text.

Underneath, Picovoice SDK wake word and inference detection is powered by the [Porcupine](https://picovoice.ai/platform/porcupine/) and [Rhino](https://picovoice.ai/platform/porcupine/) engines, respectively. If you wish to use those engines individually, you can use the npm packages specific to them.

## Compatibility

This library is compatible with Vue:
- Vue.js 2.6.11+
- Vue.js 3.0.0+

The Picovoice SDKs for Web are powered by WebAssembly (WASM), the Web Audio API, and Web Workers.

All modern browsers (Chrome/Edge/Opera, Firefox, Safari) are supported, including on mobile. Internet Explorer is _not_ supported.

Using the Web Audio API requires a secure context (HTTPS connection), except for `localhost`, for local development.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret. 
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Installation

Install the package using `npm` or `yarn`. You will also need to add the `@picovoice/web-voice-processor` and one of the `@picovoice/picovoice-web-xx-worker` series of packages for the language-specific model:

E.g. English:

```console
yarn add @picovoice/picovoice-web-vue @picovoice/picovoice-web-en-worker @picovoice/web-voice-processor
```

## Usage

Import the `picovoiceMixin` from the `@picovoice/picovoice-web-vue` package which exposes the variable `$picovoice` to your component. The mixin exposes the following functions:

- `init`: initializes Picovoice.
- `start`: starts processing audio and either detect wake work or infer context.
- `pause`: stops processing audio.
- `delete`: cleans up used resources.

Use the `init` function and `PicovoiceWorkerFactory` to initialize the instance of Picovoice and start processing audio:

```html
<script lang="ts">
import picovoiceMixinfrom '@picovoice/picovoice-web-vue';
import { PicovoiceWorkerFactory as PicovoiceWorkerFactoryEn } from '@picovoice/picovoice-web-en-worker';

export default {
  name: 'VoiceWidget',
  mixins: [picovoiceMixin],
  data: function () {
    return {
      inference: null,
      isError: false,
      isLoaded: false,
      isListening: false,
      isTalking: false,
      factory: PicovoiceWorkerFactoryEn,
      factoryArgs: {
        accessKey: '${ACCESS_KEY}', // AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)
        porcupineKeyword: { builtin: 'Picovoice', sensitivity: 0.6 },
        rhinoContext: {
          base64: 'RHINO_TRAINED_CONTEXT_BASE_64_STRING'
        },
      }
    };
  },
  created() {
    this.$picovoice.init(
      this.factoryArgs,
      this.factory,
      this.pvKeywordFn,
      this.pvInferenceFn,
      this.pvInfoFn,
      this.pvReadyFn,
      this.pvErrorFn
    );
  },
  methods: {
    pvReadyFn: function () {
      this.isLoaded = true;
      this.isListening = true;
      this.engine = "ppn";
    },
    pvInfoFn: function (info: string) {
      this.info = info;
    },
    pvKeywordFn: function (keyword: string) {
      this.detections = [...this.detections, keyword];
      this.engine = "rhn";
    },
    pvInferenceFn: function (inference: RhinoInferenceFinalized) {
      this.inference = inference;
      this.engine = "ppn";
    },
    pvErrorFn: function (error: Error) {
      this.isError = true;
      this.errorMessage = error.toString();
    },
  },
};
</script>
```

## Custom Wake Words and Contexts

Custom wake words and contexts are generated using [Picovoice Console](https://picovoice.ai/console/). They are trained from text using transfer learning into bespoke Porcupine keyword files with a `.ppn` extension and Rhino context files with a `.rhn` extension. The target platform is WebAssembly (WASM), as that is what backs the Vue library.

The `.zip` file contains a `.ppn` or `.rhn` file and a `_b64.txt` file which contains the binary model encoded with Base64. Copy the base64 and provide it as an argument to Picovoice as below:

```typescript
factoryArgs: {
  accessKey: "${ACCESS_KEY}", // AccessKey obtained from Picovoice Console(https://picovoice.ai/console/)
  start: true,
  porcupineKeyword: { custom: base64: '${KEYWORD_FILE_64}', custom: 'Deep Sky Blue', sensitivity: 0.65 },
  rhinoContext: { base64: '${CONTEXT_FILE_64}' },
},
```

You may wish to store the base64 string in a separate JavaScript file and export it to keep your application code separate.
