## Picovoice iOS Demos

The minimum iOS version required to run the demo is iOS 14.0 or higher.

## AccessKey

Picovoice requires a valid `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.


## BackgroundService Demo

This demo runs microphone recording in the background and detects the wake word and context inference while the application is **not** in focus. The demo will continue to run as long as the application remains running in the background.

To run the background service demo, go to [BackgroundService](./BackgroundService) directory. Then run:

```console
pod install
```

Open `PicovoiceBackgroundServiceDemo.xcworkspace` and paste your `AccessKey` into the `ACCESS_KEY` variable in `ContentView.swift`. Then, build and run the demo through XCode.

## ForegroundApp Demo

This demo runs wake word detection and context inference while the application is in focus. 

To run the foreground application demo, go to [ForegroundApp](./ForegroundApp) directory. Then run:

```console
pod install
```

Open the `PicovoiceForegroundAppDemo.xcworkspace` and paste your `AccessKey` into the `ACCESS_KEY` variable in `ContentView.swift`. Then, build and run the demo through XCode.

## Wake Word Detection and Context Inference

The default wake word is `Picovoice`. The default Rhino Speech-to-Intent context is `Smart Lighting`. Simply press start and the engine can recognize commands such as:

> Picovoice, turn off the lights.

or

> Picovoice, set the lights in the bedroom to blue.

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

## Running the On-Device Unit Tests

Open `PicovoiceForegroundAppDemo.xcworkspace` with XCode and run the tests with `Product > Test`.