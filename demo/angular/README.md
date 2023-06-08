# picovoice-angular-demo

This demo application includes a sample `VoiceWidget` Angular component which uses the `PicovoiceService`. Picovoice wake word detection is handled via the `wakeWordDetection$` event. Inference is handled via the `inference$` event. The `VoiceWidget` subscribes to these events and displays the results.

If you decline microphone permission in the browser, or another such issue prevents Picovoice from starting, the error will be displayed.

The widget shows the various loading and error events, as well as mounting/unmounting the `VoiceWidget` with a toggle, demonstrating the complete lifecycle of Picovoice within an Angular app.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to obtain your `AccessKey`.

## Install and Run

Use `yarn` or `npm` to install the dependencies, and the `start` script with a language code
to start a local web server hosting the demo in the language of your choice (e.g. `pl` -> Polish, `ko` -> Korean).
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

Open `http://localhost:4200/` in your browser.

## Usage

1) Enter your `AccessKey` in the provided input field
2) Click the `Init Picovoice` button and wait until Picovoice has been initialized
3) Click the `Start` button to start recording audio
4) Say the indicated wakeword, then try to say a command within the context indicated at the bottom of the page
