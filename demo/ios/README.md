## Picovoice iOS Demos

The minimum iOS version required to run the demo is iOS 14.0 or higher.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## BackgroundService Demo

This demo runs microphone recording in the background and detects the wake word and context inference while the application is **not** in focus. The demo will continue to run as long as the application remains running in the background.

To run the background service demo, go to [BackgroundService](./BackgroundService) directory. Then run:

```console
pod install
```

Open `PicovoiceBackgroundServiceDemo.xcworkspace` and paste your `AccessKey` into the `ACCESS_KEY` variable in `ContentView.swift`. Then, build and run the demo through XCode.

## ForegroundApp Demo

This demo runs wake word detection and context inference while the application is in focus. 

To run the foreground application demo:

1) Go to [ForegroundApp](./ForegroundApp) directory. Then run:

2) Open the `PicovoiceForegroundAppDemo.xcworkspace` in XCode

3) Replace `let accessKey = "${YOUR_ACCESS_KEY_HERE}"` in the file [ContentView.swift](./ForegroundApp/PicovoiceForegroundAppDemo/ContentView.swift) with your `AccessKey`.

4) Go to `Product > Scheme` and select the scheme for the language you would like to demo (e.g. `arScheme` -> Arabic Demo, `deScheme` -> German Demo)

5) Run the demo with a simulator or connected iOS device

6) Once the demo app has started, press the `start` button to start detecing keywords and infering context. To see more details about
the current context information, press the `Context Info` button on the top right corner in the app.
