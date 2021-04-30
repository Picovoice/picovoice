# picovoice-web-react

React hook for Picovoice SDK for Web.

Picovoice is also available for React Native, as a separate package. See [@picovoice/picovoice-react-native](https://www.npmjs.com/package/@picovoice/picovoice-react-native).

To use the Porcupine or Rhino engines individually with React, see [@picovoice/porcupine-web-react](https://www.npmjs.com/package/@picovoice/porcupine-web-react) and [@picovoice/porcupine-rhino-react](https://www.npmjs.com/package/@picovoice/rhino-web-react), respectively.

## Introduction

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

All processing is done via WebAssembly and Workers in a separate thread. Speech results are converted into inference directly, without intermediate Speech-to-Text.

Underneath, Picovoice SDK wake word and inference detection is powered by the [Porcupine](https://picovoice.ai/platform/porcupine/) and [Rhino](https://picovoice.ai/platform/porcupine/) engines, respectively. If you wish to use those engines individually, you can use the npm packages specific to them.

## Compatibility

The Picovoice SDK for Web is powered by WebAssembly (WASM), the Web Audio API, and Web Workers.

All modern browsers (Chrome/Edge/Opera, Firefox, Safari) are supported, including on mobile. Internet Explorer is _not_ supported.

Using the Web Audio API requires a secure context (HTTPS connection), with the exception of `localhost`, for local development.

## Installation

Use `npm` or `yarn` to install the Picovoice React package and its peer dependencies. Each spoken language (e.g. 'en', 'de') is a separate package. For this example we'll use English:

```console
yarn add @picovoice/picovoice-web-react @picovoice/picovoice-web-en-worker @picovoice/web-voice-processor
```

(or)

```console
npm install @picovoice/picovoice-web-react @picovoice/picovoice-web-en-worker @picovoice/web-voice-processor
```

## Usage

The `usePicovoice` hook provides a collection of fields and methods shown below. You can pass the `inferenceEventHandler` to respond to Rhino inference events. This example uses the sample "Clock" Rhino context, with a sensitivity of 0.65.

Make sure you handle the possibility of errors with the `isError` and `errorMessage` fields. Users may not have a working microphone, and they can always decline (and revoke) permissions; your application code should anticipate these scenarios.

### Static Import

Using static imports for the `picovoice-web-xx-worker` packages is straightforward, but will impact your initial bundle size with an additional ~2MB. Depending on your requirements, this may or may not be feasible. If you require a small bundle size, see dynamic importing below.

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
    contextInfo,
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
      // "Picovoice" is one of the builtin wake words, so we merely need to ask for it by name.
      // To use a custom wake word, you supply the `.ppn` files in base64 and provide a label for it.
      porcupineKeyword: "Picovoice",
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

### Dynamic Import / Code Splitting

If you are shipping the Picovoice SDK for Web and wish to avoid adding its ~4-6MB to your application's initial bundle, you can use dynamic imports. These will split off the porcupine-web-xx-worker packages into separate bundles and load them asynchronously. This means we need additional logic.

We add a `useEffect` hook to kick off the dynamic import. We store the result of the dynamically loaded worker chunk into a `useState` hook. When `usePicovoice` receives a non-null/undefined value for the worker factory, it will start up Picovoice.

See the [Webpack docs](https://webpack.js.org/guides/code-splitting/) for more information about Code Splitting.

```javascript
import { useState, useEffect } from "react";
// Note we are not statically importing "@picovoice/picovoice-web-en-worker" here
import { usePicovoice } from "@picovoice/picovoice-web-react";

const RHN_CONTEXT_CLOCK_64 = /* Base64 representation of English-language `clock_wasm.rhn`, omitted for brevity */

export default function VoiceWidget() {
  const [workerChunk, setWorkerChunk] = useState({ workerFactory: null });

  useEffect(() => {
    async function loadPorcupineWorkerChunk() {
      const pvWorkerFactory = (await import("@picovoice/picovoice-web-en-worker")).PicovoiceWorkerFactory; // <-- Dynamically import the worker
      console.log("Picovoice worker chunk is loaded.");
      return pvWorkerFactory;
    }
    if (workerChunk.workerFactory === null) { // <-- We only want to load once!
      console.log(4)
      loadPorcupineWorkerChunk().then((ppnWorkerFactory) => {

        setWorkerChunk({ workerFactory: ppnWorkerFactory });
      });
    }
  }, [workerChunk]);
  
  const [keywordDetections, setKeywordDetections] = useState([]);
  const [inference, setInference] = useState(null);

  const inferenceEventHandler = (rhinoInference) => {
    console.log(rhinoInference);
    setInference(rhinoInference);
  };

  const keywordEventHandler = (porcupineKeywordLabel) => {
    console.log(porcupineKeywordLabel);
    setKeywordDetections((x) => [...x, porcupineKeywordLabel]);
    setInference("...")
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
    workerChunk.workerFactory, // <-- When this is null/undefined, it's ignored. Otherwise, usePicovoice will start.
    { 
      picovoiceHookArgs: 
      {
        porcupineKeyword: "Picovoice",
        rhinoContext: { base64: RHN_CONTEXT_CLOCK_64 },
      }
    },
    keywordEventHandler,
    inferenceEventHandler
  );
```

**Important Note**: Internally, `usePicovoice` performs work asynchronously to initialize, as well as asking for microphone permissions. Not until the asynchronous tasks are done and permission given will Picovoice actually be running. Therefore, it makes sense to use the `isLoaded` state to update your UI to let users know your application is actually ready to process voice (and `isError` in case something went wrong). Otherwise, they may start speaking and their audio data will not be processed, leading to a poor/inconsistent experience.
