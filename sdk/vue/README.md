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

### Initialize Picovoice Mixin

Note: Due to limitations on Vue, a component can only have one instance of Picovoice. 
If you require multiple instances of Picovoice, check out [Picovoice Web SDK](https://github.com/Picovoice/picovoice/tree/master/sdk/web).

To initialize Picovoice, create the following callback functions:

Create the following functions:
- `wakeWordCallback` function called when the wake word has been detected
- `inferenceCallback` function called when a command inference has been made
- `contextInfoCallback` function that delivers the contents of the Rhino context that has been loaded 
- `isLoadedCallback` function called when Picovoice has loaded and unloaded
- `isListeningCallback` function called when Picovoice has started/stopped processing audio
- `errorCallback` function to catch any errors that occur

```typescript
methods: {
  wakeWordCallback: function(detection) {
    console.log(`Picovoice detected keyword: ${detection.label}`);
  },
  inferenceCallback: function(inference) {    
    if (inference.isUnderstood) {
      console.log(inference.intent)
      console.log(inference.slots)
    }
  },
  contextInfoCallback: function(contextInfo) {
    console.log(contextInfo);
  },
  isLoadedCallback: function(isLoaded) {
    console.log(isLoaded);
  },
  isListeningCallback: function(isListening) {
    console.log(isListening);
  },
  errorCallback: function(error) {
    console.error(error);
  }
};
```


Import `Picovoice` mixin, add it to your component and initialize Picovoice with the `init` function:

```html
<script lang="ts">
  import picovoiceMixin from "@picovoice/picovoice-vue";

  export default {
    mixins: [picovoiceMixin],
    mounted() {
      this.$picovoice.init(
              ${ACCESS_KEY},
              porcupineKeyword,
              wakeWordCallback,
              porcupineModel,
              rhinoContext,
              inferenceCallback,
              rhinoModel,
              this.contextInfoCallback,
              this.isLoadedCallback,
              this.isListeningCallback,
              this.errorCallback,
      );
    }
  }
</script>
```

### Processing Audio

The Picovoice Vue SDK takes care of audio processing internally using our [WebVoiceProcessor](https://github.com/Picovoice/web-voice-processor) to record audio.
To start listening for your wake word and follow-on commands, call the `start` function:

```typescript
await this.$picovoice.start();
```

If audio recording has begun, `isListening` will be set to true.
`wakeWordCallback` and `inferenceCallback` will be called when Picovoice has detected the wake word
or made an inference.

Run `stop` to stop audio recording:

```typescript
await this.$picovoice.stop();
```

`isListening` should be set to false after `stop`.

### Release

Run `release` to clean up all resources used by Picovoice:

```typescript
await this.$picovoice.release();
```

This will set `isLoaded` and `isListening` to false.

## Custom Keyword and Contexts

Create custom keywords and contexts using the [Picovoice Console](https://console.picovoice.ai/).
To use them with the Web SDK, train the keywords and contexts for the target platform WebAssembly (WASM).
Inside the downloaded `.zip` file, there will be a `.ppn` or `.rhn` file which is the keyword or context file in binary format.

Similar to the model file (`.pv`), these files are saved in IndexedDB to be used by Web Assembly.
Either `base64` or `publicPath` must be set for each file to initialize Picovoice. If both are set, Picovoice will use
the `base64` model.

## Non-English Languages

In order to use Picovoice with non-English you need to use the corresponding model file (`.pv`). The model files for all
supported languages are available in the [Porcupine](https://github.com/Picovoice/porcupine/tree/master/lib/common) and 
[Rhino](https://github.com/Picovoice/rhino/tree/master/lib/common) GitHub repositories.

## Demo

For example usage refer to the [Vue demo application](https://github.com/Picovoice/picovoice/tree/master/demo/vue).
