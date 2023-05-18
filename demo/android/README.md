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

Once the demo app has started, press the `start` button to start detecting keywords and inferring context. To see more details about
the current context information, press the `Context Info` button on the top right corner in the app.

## Running the Instrumented Unit Tests

Ensure you have an Android device connected or simulator running. Then run the following from the terminal:

```console
cd demo/android/Activity
./copy_test_resources.sh
./gradlew connectedAndroidTest
```

The test results are stored in `picovoice-activity-demo-app/build/reports`.
