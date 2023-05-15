# Picovoice Android Demos

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Activity

This demo is intended for applications that need to do voice recognition when in focus.

Copy your AccessKey into the `ACCESS_KEY` variable in `MainActivity.java` before building the demo.

## Service

This demo is intended for applications that need to do voice recognition in the background.

**NOTE:** If running the Porcupine as a service on Android < 10, you will need to stop the service before attempting to record audio in another application. This is a limitation of the Android OS that is documented [here](https://developer.android.com/guide/topics/media/sharing-audio-input).

Copy your AccessKey into the `ACCESS_KEY` variable in `PicovoiceService.java` before building the demo.

## Setup

1. Open the project in Android Studio
2. Go to `Build > Select Build Variant...` and select the language you would like to run the demo in (e.g. enDebug -> English, itRelease -> Italian)
3. Build and run on an installed simulator or a connected Android device

## Running the Demo

The default wake word is `Porcupine`. The default Rhino Speech-to-Intent context is `Smart Lighting`. Simply press start
and the engine can recognize commands such as:

> Porcupine, turn off the lights.

or

> Porcupine, set the lights in the bedroom to blue.

See below for the full context:

```yaml
context:
  expressions:
    changeColor:
      - "[turn, make] (all, the) lights $color:color"
      - "[change, set, switch] (all, the) lights to $color:color"
      - "[turn, make] (the) $location:location (color, light, lights) $color:color"
      - "[change, set, switch] (the) $location:location (color, light, lights) to $color:color"
      - "[turn, make] (the) [color, light, lights] [at, in] (the) $location:location $color:color"
      - "[change, set, switch] (the) [color, light, lights] [at, in] (the) $location:location to $color:color"
      - "[turn, make] (the) [color, light, lights] $color:color [at, in] (the) $location:location"
      - "[change, set, switch] (the) [color, light, lights] to $color:color [at, in] (the) $location:location"
    changeLightState:
      - "[switch, turn] $state:state (all, the) lights"
      - "[switch, turn] (all, the) lights $state:state"
      - "[switch, turn] $state:state (the) $location:location (light, lights)"
      - "[switch, turn] (the) $location:location [light, lights] $state:state"
      - "[switch, turn] $state:state (the) [light, lights] [at, in] (the) $location:location"
      - "[switch, turn] (the) [light, lights] [in, at] the $location:location $state:state"
    changeLightStateOff:
      - "shut off (all, the) lights"
      - "shut (all, the) lights off"
      - "shut off (the) $location:location (light, lights)"
      - "shut (the) $location:location (light, lights) off"
      - "shut off (the) [light, lights] [at, in] (the) $location:location"
      - "shut (the) [light, lights] off [at, in] (the) $location:location"
      - "shut (the) [light, lights] [at, in] (the) $location:location off"
  slots:
    color:
      - "blue"
      - "green"
      - "orange"
      - "pink"
      - "purple"
      - "red"
      - "white"
      - "yellow"
    state:
      - "off"
      - "on"
    location:
      - "bathroom"
      - "bedroom"
      - "closet"
      - "hallway"
      - "kitchen"
      - "living room"
      - "pantry"
```

## Running the Instrumented Unit Tests

Ensure you have an Android device connected or simulator running. Then run the following from the terminal:

```console
cd demo/android/Activity
./copy_test_resources.sh
./gradlew connectedAndroidTest
```

The test results are stored in `picovoice-activity-demo-app/build/reports`.
