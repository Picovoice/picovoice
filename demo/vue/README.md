# Picovoice Vue Demo

**NOTE**: Although this demo uses Vue 3, the [Picovoice Vue SDK](https://github.com/Picovoice/picovoice/tree/master/sdk/vue)
is compatible with both Vue 2 and Vue 3.

This demo application includes a sample `VoiceWidget` Vue component which uses the `picovoiceMixin` service.
Wake word events are handled via the `keywordCallback` function.
Inference events are handled via the `inferenceCallback` function.
Our VoiceWidget subscribes to this event and displays the results.

If you decline microphone permission in the browser, or another such issue prevents Picovoice from starting, the error will be displayed.

The widget showcases the various events created by the `picovoiceMixin`, demonstrating the complete lifecycle of Picovoice within a Vue app.

This project was bootstrapped with Vue CLI. See the [Configuration Reference](https://cli.vuejs.org/config/).

## Install & Run

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

The command-line output will provide you with a localhost link and port to open in your browser.

## Usage

1) Enter your `AccessKey` in the provided input field
2) Click the `Init Picovoice` button and wait until Picovoice has been initialized
3) Click the `Start` button to start recording audio
4) Say the indicated wakeword, then try to say a command within the context indicated at the bottom of the page
