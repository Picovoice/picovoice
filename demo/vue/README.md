# Picovoice Vue Demo

This demo application includes a sample `VoiceWidget` Vue component which uses the `picovoiceMixin` service. 
Wake word events are handled via the `keywordCallback` function. 
Inference events are handled via the `inferenceCallback` function. 
Our VoiceWidget subscribes to this event and displays the results.

If you decline microphone permission in the browser, or another such issue prevents Picovoice from starting, the error will be displayed.

The widget showcases the various events created by the `picovoiceMixin`, demonstrating the complete lifecycle of Picovoice within a Vue app.

This project was bootstrapped with Vue CLI. See the [Configuration Reference](https://cli.vuejs.org/config/).

## Install & run

```console
yarn
yarn start
```

The command-line output will provide you with a localhost link and port to open in your browser.

## Try Picovoice

Try saying the wake word "Picovoice", and then a command in the "Clock" context:

> "Picovoice, set a timer for ten seconds"

Picovoice's inference result will appear:

```json
{
  "isFinalized": true,
  "isUnderstood": true,
  "intent": "setTimer",
  "slots": { "minutes": "1" }
}
```

Try another interaction, and this time try follow-on command that is outside the Clock context:

> "Picovoice, tell me a joke"

```json
{ "isFinalized": true, "isUnderstood": false, "intent": null, "slots": {} }
```

### Clock context YAML source

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
