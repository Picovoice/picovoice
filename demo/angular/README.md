# picovoice-web-angular-demo

This demo application includes a sample `VoiceWidget` Angular component which uses the `PicovoiceService` Angular service to allow naturally spoken commands to be converted to intents. Picovoice keyword detection is handled via the `$keyword` event. Inference is handled via the `inference$` event. Our `VoiceWidget` subscribes to this event and displays the results.

The demo uses dynamic imports to split the Picovoice workers away from the main application bundle. This means that the initial download size of the Angular app will not be impacted by the `~4-6MB` requirement of Picovoice. While small for all-in-one offline Voice AI, the size is large for an initial web app load.

If you decline microphone permission in the browser, or another such issue prevents Picovoice from starting, the error will be displayed.

The widget shows the various loading and error events, as well as mounting/unmounting the `VoiceWidget` with a toggle, demonstrating the complete lifecycle of Picovoice with in an Angular app.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.5.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Install and run

Use `yarn` or `npm` to install then start the demo application:

```console
yarn
yarn start
```

(or)

```console
npm install
npm run start
```

Open `http://localhost:4200/` in your browser.

## Try Picovoice

With the demo application running in your browser (and microphone permissions granted), try saying the following:

> "Picovoice, set a timer for one minute"

The result should look similar to this:

```json
{
  "isFinalized": true,
  "isUnderstood": true,
  "intent": "setAlarm",
  "slots": {
    "minutes": "1"
  }
}
```

Try a phrase that is out-of-context:

> "Picovoice, what's my horoscope?"

```json
{
  "isFinalized": true,
  "isUnderstood": false,
  "intent": null,
  "slots": {}
}
```

This command falls outside the domain of "Alarm Clock" and is therefore not understood.

The Alarm Clock was trained to understand a particular set of expressions. These are built using a simple grammar and grouped together into a YAML file. This file is trained by [Picovoice Console](https://console.picovoice.ai/) to create a `.rhn` file for the WebAssembly (WASM) platform.

```yaml
context:
  expressions:
    setAlarm:
      - "set (a, an, the) [alarm, timer] for $pv.TwoDigitInteger:hours [hour, hours] (and) $pv.TwoDigitInteger:minutes [minute, minutes] (and) $pv.TwoDigitInteger:seconds [second, seconds]"
      - "set (a, an, the) [alarm, timer] for $pv.TwoDigitInteger:hours [hour, hours] (and) $pv.TwoDigitInteger:minutes [minute, minutes]"
      - "set (a, an, the) [alarm, timer] for $pv.TwoDigitInteger:hours [hour, hours] (and) $pv.TwoDigitInteger:seconds [second, seconds]"
      - "set (a, an, the) [alarm, timer] for $pv.TwoDigitInteger:hours [hour, hours]"
      - "set (a, an, the) [alarm, timer] for $pv.TwoDigitInteger:minutes [minute, minutes] (and) $pv.TwoDigitInteger:seconds [second, seconds]"
      - "set (a, an, the) [alarm, timer] for $pv.TwoDigitInteger:minutes [minute, minutes]"
      - "set (a, an, the) [alarm, timer] for $pv.TwoDigitInteger:seconds [second, seconds]"
      - "$pv.TwoDigitInteger:hours [hour, hours] (and) $pv.TwoDigitInteger:minutes [minute, minutes] (and) $pv.TwoDigitInteger:seconds [second, seconds]"
      - "$pv.TwoDigitInteger:hours [hour, hours] (and) $pv.TwoDigitInteger:minutes [minute, minutes]"
      - "$pv.TwoDigitInteger:hours [hour, hours] (and) $pv.TwoDigitInteger:seconds [second, seconds]"
      - "$pv.TwoDigitInteger:hours [hour, hours]"
      - "$pv.TwoDigitInteger:minutes [minute, minutes] (and) $pv.TwoDigitInteger:seconds [second, seconds]"
      - "$pv.TwoDigitInteger:minutes [minute, minutes]"
      - "$pv.TwoDigitInteger:seconds [second, seconds]"
    reset:
      - "reset (the) (timer)"
    pause:
      - "[pause, stop] (the) (timer)"
    resume:
      - "resume (the) (timer)"
```
