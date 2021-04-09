# picovoice-web-react-demo

This demo application includes a `VoiceWidget` React function component which includes the `usePicovoice` react hook to allow keyword (hotword / wake word / wake up word) detection and follow-on naturally spoken commands inference. Keyword  detection is handled with the `keywordEventHandler` callback function; inference is handled via the `inferenceEventHandler` callback function.

If you decline microphone permission in the browser, or another such issue prevents Picovoice from starting, the error will be displayed.

The widget shows the various loading and error states, as well as mounting/unmounting the `VoiceWidget` with a toggle button, demonstrating the complete lifecycle of the Picovoice SDK within a React app.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Install and Run

Use `yarn` or `npm` to install the demo packages and start a local server where you can try the demo:

```bash
yarn
yarn start
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Try voice commands

The demo uses "Bumblebee" as the Porcupine wake word and "Alarm Clock" as the Rhino context for follow-on commands.

When the demo is loaded and you have granted microphone permissions, say the following e.g.:

> "Bumblebee, set a timer for five minutes"

The output should look similar to below:

```json
Keyword Detections:
Bumblebee

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

You can see that when the wake word "Bumblebee" is detected, internally Picovoice SDK switches control to the Rhino ('rhn') engine for naturally-spoken command inference. Rhino operates on a specific domain for dramatic efficiency and performance gains over generic Speech-to-Text transcription approaches. In this instance, it understands commands in the domain of "Alarm Clock".

The voice engine control will return to Porcupine ('ppn'), which will once again be listening for "Bumblebee" to start the voice interaction again.

> "Bumblebee, what's the meaning of life?"

```json
Keyword Detections:
Bumblebee

Inference:
{
  "isFinalized": true,
  "isUnderstood": false,
  "intent": null,
  "slots": {}
}
```

This command falls outside of the domain of "Alarm Clock" and is therefore not understood.

The Alarm Clock was trained to understand a particular set of expressions. These are built using a simple grammar and grouped together into a YAML file. This file is trained by [Picovoice Console](https://picovoice.ai/console/) to create a `.rhn` file.

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

