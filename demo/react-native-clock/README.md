# React Native Clock with Voice Commands

To run the PicoClock app you'll first need to install yarn and set up your React Native environment. For this, please refer to [React Native's documentation](https://reactnative.dev/docs/environment-setup). Once your environment has been set up, you can run the following commands from this repo location.

## AccessKey

All demos require a valid Picovoice `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

Once you obtain your `AccessKey`, replace it in [App.tsx](App.tsx) file:

```javascript
readonly _accessKey = "${YOUR_ACCESS_KEY_HERE}"; // AccessKey obtained from Picovoice Console (https://picovoice.ai/console/)
```

## Usage

### Running On Android
```console
yarn android-install    # sets up environment
yarn android-run        # builds and deploys to Android
```

### Running On iOS

```console
yarn ios-install        # sets up environment
yarn ios-run            # builds and deploys to iOS
```

The default wake word is `Pico Clock`. The default Rhino Speech-to-Intent context is `Clock`. Simply press start
and the engine can recognize commands such as:

> PicoClock, set a timer for 5 minutes.

or

> PicoClock, start stopwatch

See below for the full context:

```yaml
context:
  expressions:
    timer:
      - $timerAction:action timer
    stopwatch:
      - $stopwatchAction:action stopwatch
    clock:
      - $clockAction:action (me) (the) clock
      - $clockAction:action (me) (the) time
    setTimer:
      - set (a) timer for $pv.TwoDigitInteger:hours [hour, hours]
      - set (a) timer for $pv.TwoDigitInteger:minutes [minute, minutes]
      - set (a) timer for $pv.TwoDigitInteger:seconds [second, seconds]
      - set (a) timer for $pv.TwoDigitInteger:hours [hour, hours] (and)
        $pv.TwoDigitInteger:minutes [minute, minutes]
      - set (a) timer for $pv.TwoDigitInteger:hours [hour, hours] (and)
        $pv.TwoDigitInteger:minutes [minute, minutes] (and)
        $pv.TwoDigitInteger:seconds [second, seconds]
      - set (a) timer for $pv.TwoDigitInteger:minutes [minute, minutes] (and)
        $pv.TwoDigitInteger:seconds [second, seconds]
      - set (a) timer for $pv.TwoDigitInteger:hours [hour, hours] (and)
        $pv.TwoDigitInteger:seconds [second, seconds]
    setAlarm:
      - set (an) alarm for $pv.TwoDigitInteger:hour $pv.TwoDigitInteger:minute
        $amPm:amPm
      - set (an) alarm for $pv.TwoDigitInteger:hour $amPm:amPm
      - set (an) alarm for $day:day (at) $pv.TwoDigitInteger:hour
        $pv.TwoDigitInteger:minute $amPm:amPm
      - set (an) alarm for $day:day (at) $pv.TwoDigitInteger:hour $amPm:amPm
      - set (an) alarm for $pv.TwoDigitInteger:hour $pv.TwoDigitInteger:minute
        $amPm:amPm (on) $day:day
      - set (an) alarm for $pv.TwoDigitInteger:hour $amPm:amPm (on) $day:day
    alarm:
      - $alarmAction:action alarm
    availableCommands:
      - what can I say
  slots:
    timerAction:
      - start
      - pause
      - stop
      - reset
      - show
      - restart
      - clear
    clockAction:
      - show
    stopwatchAction:
      - start
      - stop
      - pause
      - reset
      - restart
      - show
    amPm:
      - a m
      - p m
    day:
      - today
      - tomorrow
      - monday
      - tuesday
      - wednesday
      - thursday
      - friday
      - saturday
      - sunday
    alarmAction:
      - delete
```
