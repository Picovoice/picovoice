# picovoice-web-react

React hook for Picovoice SDK for Web.

Picovoice is also available for React Native, as a separate package. See [@picovoice/picovoice-react-native](https://www.npmjs.com/package/@picovoice/picovoice-react-native).

Picovoice is also availble for NodeJS, as a separate package. See [@picovoice/picovoice-node](https://www.npmjs.com/package/@picovoice/picovoice-node).

To use the Porcupine or Rhino engines individually with React, see [@picovoice/porcupine-web-react](https://www.npmjs.com/package/@picovoice/porcupine-web-react) and [@picovoice/porcupine-rhino-react](https://www.npmjs.com/package/@picovoice/rhino-web-react), respectively

## Introduction

This library provides a unified wake word and follow-on naturally spoken command engine in-browser, offline. This allows a complete Voice AI interaction loop, such as the following:

> "Pico Clock, set a timer for two minutes"

Where "Pico Clock" is the wake word to start the interaction, and the follow-on command is processed and directly converted from speech into structured data:

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

> "Pico Clock, Tell me a joke"

```json
{
  "isUnderstood": false
}
```

All processing is done via WebAssembly and Workers in a separate thread. Speech results are converted into inference directly, without intermediate Speech-to-Text.

Underneath, Picovoice SDK wake word and inference detection is powered by the [Porcupine](https://picovoice.ai/platform/porcupine/) and [Rhino](https://picovoice.ai/platform/porcupine/) engines, respectively. If you wish to use those engines individually, you can use the npm packages specific to them.


## Compatibility

The Picovoice SDKs for Web are powered by WebAssembly (WASM), the Web Audio API, and Web Workers.

All modern browsers (Chrome/Edge/Opera, Firefox, Safari) are supported, including on mobile. Internet Explorer is _not_ supported.

Using the Web Audio API requires a secure context (HTTPS connection), with the exception of `localhost`, for local development.

## Installation

Use `npm` or `yarn` to install the package and its peer dependencies. Each spoken language (e.g. 'en', 'de') is a separate package. For this example we'll use English:

`yarn add @picovoice/picovoice-web-react @picovoice/picovoice-web-en-worker`

(or)

`npm install @picovoice/picovoice-web-react @picovoice/picovoice-web-en-worker`

## Usage

The `usePicovoice` hook provides a collection of fields and methods shown below. You can pass the `inferenceEventHandler` to respond to Rhino inference events. This example uses the sample "Clock" Rhino context, with a sensitivity of 0.65.

Make sure you handle the possibility of errors with the `isError` and `errorMessage` fields. Users may not have a working microphone, and they can always decline (and revoke) permissions; your application code should anticipate these scenarios.

```javascript
import React, { useState } from 'react';
// Import the specific PicovoiceWorkerFactory for the spoken language used: in this case, English (en).
import { PicovoiceWorkerFactory } from '@picovoice/picovoice-web-en-worker';
import { usePicovoice } from '@picovoice/picovoice-web-react';

const RHN_CONTEXT_CLOCK_64 = /* Base64 representation of English-language `clock_wasm.rhn`, omitted for brevity */

export default function VoiceWidget() {
  const [keywordDetections, setKeywordDetections] = useState([]);
  const [inference, setInference] = useState(null);

  const inferenceEventHandler = (rhinoInference) => {
    console.log(rhinoInference);
    setInference(rhinoInference);
  };

  const keywordEventHandler = (porcupineKeywordLabel) => {
    console.log(porcupineKeywordLabel);
    setKeywordDetections((x) => [...x, porcupineKeywordLabel]);
  };

  const {
    isLoaded,
    isListening,
    isError,
    errorMessage,
    start,
    resume,
    pause,
    engine,
  } = usePicovoice(
    PicovoiceWorkerFactory,
    {
      // "Bumblebee" is one of the builtin wake words, so we merely need to ask for it by name.
      // To use a custom wake word, you supply the `.ppn` files in base64 and provide a label for it.
      porcupineKeyword: "Bumblebee",
      rhinoContext: { base64: RHN_CONTEXT_CLOCK_64 },
      start: true,
    },
    keywordEventHandler,
    inferenceEventHandler
  );

return (
  <div className="voice-widget">
    <h3>Engine: {engine}</h3>
    <h3>Keyword Detections:</h3>
    {keywordDetections.length > 0 && (
      <ul>
        {keywordDetections.map((label, index) => (
          <li key={index}>{label}</li>
        ))}
      </ul>
    )}
    <h3>Latest Inference:</h3>
    {JSON.stringify(inference)}
  </div>
)
```

**Important Note**: Internally, `usePicovoice` performs work asynchronously to initialize, as well as asking for microphone permissions. Not until the asynchronous tasks are done and permission given will Picovoice actually be running. Therefore, it makes sense to use the `isLoaded` state to update your UI to let users know your application is actually ready to process voice (and `isError` in case something went wrong). Otherwise, they may start speaking and their audio data will not be processed, leading to a poor/inconsistent experience.
