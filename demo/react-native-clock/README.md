# React Native Clock with Voice Commands

To run the PicoClock app you'll first need to install yarn and setup your React Native environment. For this, please refer to [React Native's documentation](https://reactnative.dev/docs/environment-setup). Once your environment has been set up, you can run the following commands from this repo location.

## Usage

### Running On Android
```sh
yarn android-install    # sets up environment
yarn android-run        # builds and deploys to Android
```

### Running On iOS

```sh
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
