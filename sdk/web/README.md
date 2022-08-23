# Cobra Binding for Web

## Cobra Voice Activity Detection Engine

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Cobra is a highly accurate and lightweight voice activity detection (VAD) engine.

## Compatibility

- Chrome / Edge
- Firefox
- Safari

## Installation

Using `yarn`:

```console
yarn add @picovoice/cobra-web
```

or using `npm`:

```console
npm install --save @picovoice/cobra-web
```

### AccessKey

Cobra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Cobra SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

### Usage

#### Initialization

Create a `voiceProbabilityCallback` function to get voice probability results
from the engine:

```typescript

function voiceProbabilityCallback(voiceProbability: number) {

}
```

Add a `processErrorCallback` function to the `options` object if you would like
to catch errors that occur while processing audio:

```typescript
function processErrorCallback(error: string) {

}

options.processErrorCallback = processErrorCallback;
```

Use `Cobra` to initialize the engine on the main thread:

```typescript
const cobra = await Cobra.create(
    ${ACCESS_KEY},
    voiceProbabilityCallback,
    options
);
```

Use `CobraWorker` to initialize the engine on a worker thread:

```typescript
const cobra = await CobraWorker.create(
  ${ACCESS_KEY},
  voiceProbabilityCallback,
  options
);
```

#### Process Audio

The `process` function will send the input frames to the engine.
The engine results are received via the `voiceProbabilityCallback` that's passed in during initialization.

```typescript
function getAudioData(): Int16Array {
  ... // function to get audio data
  return new Int16Array();
}

for (;;) {
  cobra.process(getAudioData());
  // break on some condition
}
```

#### Clean Up

Clean up used resources by `Cobra` or `CobraWorker`:

```typescript
await cobra.release();
```

#### Terminate (Worker only)

Terminate `CobraWorker` instance:

```typescript
await cobra.terminate();
```

## Demo

For example usage refer to our [Web demo application](https://github.com/Picovoice/cobra/tree/master/demo/web).
