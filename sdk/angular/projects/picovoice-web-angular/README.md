# picovoice-web-angular

Angular service for Picovoice for Web.

To use the Porcupine or Rhino engines individually with Angular, see [@picovoice/porcupine-web-angular](https://www.npmjs.com/package/@picovoice/porcupine-web-angular) and [@picovoice/porcupine-rhino-angular](https://www.npmjs.com/package/@picovoice/rhino-web-angular), respectively.

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

Use `npm` or `yarn` to install the package and its peer dependencies. Each spoken language (e.g. 'en', 'de') is a separate package. For this example we'll use English ('en'):

```console
yarn add @picovoice/picovoice-web-angular @picovoice/picovoice-web-en-worker
```

(or)

```console
npm install @picovoice/picovoice-web-angular @picovoice/picovoice-web-en-worker
```

## Usage

In your Angular component, add the `PicovoiceService`. The `PicovoiceService` has `keyword` and `inference` events to which you can subscribe:

```typescript
import { Subscription } from "rxjs"
import { PicovoiceService } from "@picovoice/picovoice-web-angular"

...

  constructor(private picovoiceService: PicovoiceService) {
    // Subscribe to Picovoice Keyword detections
    // Store each detection so we can display it in an HTML list
    this.keywordDetection = picovoiceService.keyword$.subscribe(
      keywordLabel => this.detections = [...this.detections, keywordLabel])
    // Subscribe to Rhino Inference events
    // Show the latest one in the widget
    this.inferenceDetection = picovoiceService.inference$.subscribe(
      inference => this.latestInference = inference)
  }
```

We need to initialize Picovoice to tell it which keyword and context we want to listen to (and at what sensitivity). We can use the Angular lifecycle hooks `ngOnInit` and `ngOnDestroy` to start up and later tear down the Picovoice engines.

## Imports

Using static imports for the picovoice-web-xx-worker packages is straightforward, but will impact your initial bundle size with an additional `~6MB`. Depending on your requirements, this may or may not be feasible. If you require a small bundle size, see dynamic importing below.

### Static Import

```typescript
import {PicovoiceWorkerFactory as pvFactoryEn } from '@picovoice/picovoice-web-en-worker'

async ngOnInit() {
    const pvFactoryEn =
    // Initialize Picovoice Service
    try {
      await this.picovoiceService.init(pvFactoryEn,
        {
          // AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)
          accessKey: "${ACCESS_KEY}",
          // Built-in wake word
          porcupineKeyword: {builtin: "Hey Google", sensitivity: 0.6},
          // Rhino context (Base64 representation of a `.rhn` file)
          rhinoContext: { base64: RHINO_CLOCK_64 },
          start: true
        })
    }
    catch (error) {
      console.error(error)
    }
  }

  ngOnDestroy() {
    this.keywordDetection.unsubscribe()
    this.inferenceDetection.unsubscribe()
    this.picovoiceService.release()
  }
```

### Dynamic Import

```typescript
  async ngOnInit() {
    // Load Picovoice worker chunk with specific language model (large ~4-6MB chunk; dynamically imported)
    const pvFactoryEn = (await import('@picovoice/picovoice-web-en-worker')).PicovoiceWorkerFactory
    // Initialize Picovoice Service
    try {
      await this.picovoiceService.init(pvFactoryEn,
        {
          // AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)
          accessKey: "${ACCESS_KEY}",
          // Built-in wake word
          porcupineKeyword: {builtin: "Hey Google", sensitivity: 0.6},
          // Rhino context (Base64 representation of a `.rhn` file)
          rhinoContext: { base64: RHINO_CLOCK_64 },
          start: true
        })
    }
    catch (error) {
      console.error(error)
    }
  }

  ngOnDestroy() {
    this.keywordDetection.unsubscribe()
    this.inferenceDetection.unsubscribe()
    this.picovoiceService.release()
  }

```
