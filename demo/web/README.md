# picovoice-web-demo

This is a basic demo to show how to use the Picovoice SDK for Web in a browsers, using the IIFE version of the library (i.e. an HTML script tag). It instantiates a Picovoice engine and uses it with the [@picovoice/web-voice-processor](https://www.npmjs.com/package/@picovoice/web-voice-processor) to access (and automatically downsample) microphone audio.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Setup

Use `yarn` or `npm` to install the dependencies, and the `start` script with a language code
to start a local web server hosting the demo in the language of your choice (e.g. `sv` -> Swedish, `zh` -> Mandarin).
To see a list of available languages, run `start` without a language code.

```console
yarn
yarn start ${LANGUAGE}
```

(or)

```console
npm install
npm run start ${LANGUAGE}
```

Open `localhost:5000` in your web browser, as hinted at in the output:

```console
Available on:
  http://localhost:5000
Hit CTRL-C to stop the server
```

## Usage
1) Enter your `AccessKey` in the provided input field and 
2) Click the `Start Picovoice` button and wait until Picovoice has been initialized.
3) Say the indicated wakeword, then try to say a command within the context indicated at the bottom.
