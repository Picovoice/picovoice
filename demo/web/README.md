# picovoice-web-demo

This is a basic demo to show how to use the Picovoice SDK for Web in a browsers, using the IIFE version of the library (i.e. an HTML script tag). It instantiates a Picovoice engine and uses it with the [@picovoice/web-voice-processor](https://www.npmjs.com/package/@picovoice/web-voice-processor) to access (and automatically downsample) microphone audio.

## AccessKey

The Picovoice SDK requires a valid `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

## Install & run

Use `yarn` or `npm` to install the dependencies, and the `start` script to start a local web server hosting the demo.

```console
yarn
yarn start
```

Open `localhost:5000` in your web browser, as hinted at in the output:

```console
Available on:
  http://localhost:5000
Hit CTRL-C to stop the server
```

Enter your `AccessKey` in the provided input field and then click the `start` button.
Wait until Picovoice and the WebVoiceProcessor have initialized.
Say "Picovoice", then say a command within the context "Pico Clock", e.g.:

> "Picovoice, set a timer for ten seconds"

```
Inference detected: {"isFinalized":true,"isUnderstood":true,"intent":"setTimer","slots":{"seconds":"10"}}
```
