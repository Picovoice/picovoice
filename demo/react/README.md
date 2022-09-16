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

Use `yarn` or `npm` to install the demo packages and start a local server where you can try the demo:

```console
yarn
yarn start
```

Open `http://localhost:3000` to view it in the browser.

## Try voice commands

The demo uses "Picovoice" as the Porcupine wake word and a "Clock" Rhino context for follow-on commands.

When the demo is loaded, and you have granted microphone permissions, say the following e.g.:

> "Picovoice, set a timer for five minutes"

The output should look similar to below:

```json
Wake word detected!

Inference:
{
  "isFinalized": true,
  "isUnderstood": true,
  "intent": "setTimer",
  "slots": {
    "minutes": "5"
  }
}
```

When the wake word "Picovoice" is detected, internally Picovoice SDK switches control to the Rhino ('rhn') engine for command inference.

After inference, the control will return to wake word detection, which will once again be listening for "Picovoice" to start the voice interaction again.

> "Picovoice, what's the meaning of life?"

```json
Wake word detected!

Inference:
{
  "isFinalized": true,
  "isUnderstood": false,
  "intent": null,
  "slots": {}
}
```

This command falls outside the domain of "Clock" and is therefore not understood.

The Clock was trained to understand a particular set of expressions. These are built using a simple grammar and grouped together into a YAML file. This file is trained by [Picovoice Console](https://console.picovoice.ai/) to create a `.rhn` file.

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
