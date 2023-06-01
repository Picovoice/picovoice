# Picovoice React Hook Demo

This demo application includes a `VoiceWidget` React function component which includes the `usePicovoice` react hook to allow wake word detection and follow-on command inference.

If you decline microphone permission in the browser, or another such issue prevents Picovoice from starting, an error will be displayed.

The widget shows the various loading and error states, as well as mounting/unmounting the `VoiceWidget` with a toggle button, demonstrating the complete lifecycle of the Picovoice SDK within a React app.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Install and Run

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

Open `http://localhost:3000` to view it in the browser.

## Usage

1) Enter your `AccessKey` in the provided input field and
2) Click the `start` button and wait until Picovoice has been initialized.
3) Say the indicated wakeword, then try to say a command within the context indicated at the bottom.
