# Picovoice SDK for Vue

# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.


## Framework Compatibility
- Vue.js 2.6.11+
- Vue.js 3.0.0+

## Browser Compatibility

- Chrome / Edge
- Firefox
- Safari

### Restrictions

IndexedDB and WebWorkers are required to use `Picovoice Vue`. Browsers without support (i.e. Firefox Incognito Mode) 
should use the [`PicovoiceWeb binding`](https://github.com/Picovoice/picovoice/tree/master/sdk/web) main thread method.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Installation

### Package

Using `yarn`:

```console
yarn add @picovoice/picovoice-vue @picovoice/web-voice-processor
```

or using `npm`:

```console
npm install --save @picovoice/picovoice-vue @picovoice/web-voice-processor
```

## Usage

Picovoice requires a Porcupine keyword file (`.ppn`), a Rhino context file (`.rhn`) and model parameter files for both engines (`.pv`).

Each file offers two options on how to provide it to Picovoice:

### Public Directory

**NOTE**: Due to modern browser limitations of using a file URL, this method does __not__ work if used without hosting a server.

This method fetches the given file from the public directory and uses it to initialize Picovoice. Set the `publicPath` string to use this method.

### Base64

**NOTE**: This method works without hosting a server, but increases the size of the model file roughly by 33%.

This method uses a base64 string of the given file and uses it to initialize Picovoice.

Use the built-in script `pvbase64` to base64 your `.ppn`, `.rhn` or `.pv` file:

```console
npx pvbase64 -i ${PICOVOICE_FILE} -o ${BASE64_FILENAME}.js
```

The output will be a js file containing a string which you can import into any file of your project.
Set the `base64` string with the imported js string use this method.

### Picovoice Initialization Files

Picovoice saves and caches your model (`.pv`), keyword (`.ppn`) and context (`.rhn`) files in the IndexedDB to be used by Web Assembly.
Use a different `customWritePath` variable choose the name the file will have in storage and set the `forceWrite` value to true to force an overwrite of the file.
If the file changes, `version` should be incremented to force the cached file to be updated.

Either `base64` or `publicPath` must be set for each file to instantiate Picovoice. If both are set for a particular file, Picovoice will use the `base64` parameter.

```typescript
// Custom keyword (.ppn)
const porcupineKeyword = {
  publicPath: ${KEYWORD_RELATIVE_PATH},
  // or
  base64: ${KEYWORD_BASE64_STRING},
  label: ${KEYWORD_LABEL},
  
  // Optional
  customWritePath: 'custom_keyword',
  forceWrite: true,
  version: 1,
  sensitivity: 0.6
}

// Context (.rhn)
const rhinoContext = {
  publicPath: ${CONTEXT_RELATIVE_PATH},
  // or
  base64: ${CONTEXT_BASE64_STRING},

  // Optionals
  customWritePath: 'custom_context',
  forceWrite: true,
  version: 1,
  sensitivity: 0.3,
}

// Model (.pv)
const porcupineOrRhinoModel = {
  publicPath: ${MODEL_RELATIVE_PATH},
  // or
  base64: ${MODEL_BASE64_STRING},

  // Optionals
  customWritePath: 'custom_model',
  forceWrite: true,
  version: 1,
}
```

Additional engine options are provided via the `options` parameter.
Use `endpointDurationSec` and `requireEndpoint` to control the engine's endpointing behaviour.
An endpoint is a chunk of silence at the end of an utterance that marks the end of spoken command.

```typescript
// Optional. These are the default values
const options = {
  endpointDurationSec: 1.0,
  requireEndpoint: true
}
```

### Initialize Picovoice

Use `usePicovoice` and `init` to initialize `Picovoice`.

In case of any errors, watch for `state.error` to check the error message, otherwise watch `state.isLoaded` to check if `Picovoice` has loaded. Also watch for `state.contextInfo` for current context information.

#### Picovoice in Vue 2

**NOTE**: If you need to call `usePicovoice` outside of `data`, make sure to add observer property via `Vue.set` or `observable`.

```vue
<script lang='ts'>
import Vue, { VueConstructor } from 'vue';
import { Picovoice, usePicovoice } from '@picovoice/picovoice-vue';

// Use Vue.extend for JavaScript
export default (Vue as VueConstructor<Vue & Picovoice>).extend({
  data() {
    const {
      state,
      init,
      start,
      stop,
      release
    } = usePicovoice();
    
    init(
      ${ACCESS_KEY},
      porcupineKeyword,
      porcupineModel,
      rhinoContext,
      rhinoModel
    );
    
    return {
      state,
      start,
      stop,
      release
    }
  },
  watch: {
    "state.wakeWordDetection": function(wakeWord) {
      if (wakeWord !== null) {
        console.log(wakeWord)
      }
    },
    "state.inference": function(inference) {
      if (inference !== null) {
        console.log(inference)
      }
    },
    "state.contextInfo": function(contextInfo) {
      if (contextInfo !== null) {
        console.log(contextInfo)
      }
    },
    "state.isLoaded": function(isLoaded) {
      console.log(isLoaded)
    },
    "state.isListening": function(isListening) {
      console.log(isListening)
    },
    "state.error": function(error) {
      console.error(error)
    },
  },
  onBeforeDestroy() {
    this.release();
  },
});
</script>
```

#### Picovoice in Vue 3

In Vue 3, we take advantage of the [Composition API](https://vuejs.org/api/composition-api-setup.html), especially the use of `reactive`.

```vue
<script lang='ts'>
import { defineComponent, onBeforeUnmount, watch } from 'vue';
import { usePicovoice } from '@picovoice/picovoice-vue';

// Use Vue.extend for JavaScript
export default defineComponent({
  setup() {
    const {
      state,
      init,
      start,
      stop,
      release
    } = usePicovoice();
    
    watch(() => state.isLoaded, (newVal) => {
      console.log(newVal);
    });
    
    watch(() => state.isListening, (newVal) => {
      console.log(newVal);
    });
    
    watch(() => state.wakeWordDetection, (wakeWord) => {
      if (wakeWord !== null) {
        console.log(wakeWord);
      }
    });
    
    watch(() => state.inference, (inference) => {
      if (inference !== null) {
        console.log(inference);
      }
    });
    
    watch(() => state.contextInfo, (contextInfo) => {
      if (contextInfo !== null) {
        console.log(contextInfo);
      }
    });
    
    watch(() => state.error, (err) => {
      if (err) {
        console.error(err);
      }
    });
    
    onBeforeUnmount(() => {
      release();
    });
    
    init(
      ${ACCESS_KEY},
      porcupineKeyword,
      porcupineModel,
      rhinoContext,
      rhinoModel
    );
    
    return {
      start,
      stop,
      release
    }
  }
});
</script>
```

### Processing Audio

The Picovoice Vue SDK takes care of audio processing internally using our [WebVoiceProcessor](https://github.com/Picovoice/web-voice-processor) to record audio.
To start listening for your wake word and follow-on commands, call the `start` function:

```typescript
await this.start();
```

If audio recording has begun, `state.isListening` will be set to true.
Use `state.wakeWordDetection` and `state.inference` to get results from Picovoice.

Run `stop` to stop audio recording:

```typescript
await this.stop();
```

`state.isListening` should be set to false after `stop`.

### Release

Run `release` to clean up all resources used by Picovoice:

```typescript
await this.release();
```

This will set `state.isLoaded` and `state.isListening` to false.

## Custom Keyword and Contexts

Create custom keywords and contexts using the [Picovoice Console](https://console.picovoice.ai/).
Train a Porcupine keyword to obtain a keyword file (`.ppn`) and a Rhino context to obtain a context file (`.rhn`).
To use them with the Web SDK, train the keywords and contexts for the target platform `Web (WASM)`.
These model files can be used directly with `publicPath`, but if `base64` is preferable, convert to base64
JavaScript variable using the built-in `pvbase64` script:

```console
npx pvbase64 -i ${INPUT_BINARY_FILE}.{ppn/rhn} -o ${OUTPUT_BASE64_FILE}.js -n ${BASE64_VAR_NAME}
```

Similar to the model file (`.pv`), these files are saved in IndexedDB to be used by Web Assembly.
Either `base64` or `publicPath` must be set for each file to initialize Picovoice. If both are set, Picovoice will use
the `base64` model.

```typescript
const picovoiceFile = {
  publicPath: "${FILE_RELATIVE_PATH}",
  // or
  base64: "${FILE_BASE64_STRING}",
}
```

## Switching Languages

In order to use Picovoice with different languages you need to use the corresponding model file (`.pv`) for the desired language. The model files for all
supported languages are available in the [Porcupine](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [Rhino](https://github.com/Picovoice/rhino/tree/master/lib/common) GitHub repositories.

## Demo

For example usage refer to the [Vue demo application](https://github.com/Picovoice/picovoice/tree/master/demo/vue).
