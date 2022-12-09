# Picovoice SDK for Android

## Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device.

Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

- Android 5.0+ (API 21+)

## Installation

Porcupine can be found on Maven Central. To include the package in your Android project, ensure you have included `mavenCentral()` in your top-level `build.gradle` file and then add the following to your app's `build.gradle`:

```groovy
dependencies {
    // ...
    implementation 'ai.picovoice:picovoice-android:${LATEST_VERSION}'
}
```

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Permissions

To enable recording with your Android device's microphone you must add the following line to your `AndroidManifest.xml` file:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.INTERNET" />
```

## Usage

There are two possibilities for integrating Picovoice into an Android application.

### High-Level API

[PicovoiceManager](./Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/PicovoiceManager.java) provides
a high-level API for integrating Picovoice into Android applications. It manages all activities related to creating an
input audio stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and
inference completion. The class can be initialized using the PicovoiceManager Builder:

```java
import ai.picovoice.picovoice.*;

final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

PicovoiceManager manager = new PicovoiceManager.Builder()
    .setAccessKey(accessKey)
    .setKeywordPath("assets_sub_folder/keyword.ppn")
    .setWakeWordCallback(new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            // logic to execute upon detection of wake word
        }
    })
    .setContextPath("assets_sub_folder/context.rhn")
    .setInferenceCallback(new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            // logic to execute upon completion of intent inference
        }
    })
    .build(appContext);
```

The keyword (`.ppn`) and context (`.rhn`) files are obtained from the [Picovoice Console](https://console.picovoice.ai/). You can store these files in the Android assets folder (`src/main/assets`) and pass the relative paths into the Picovoice Builder. Alternatively, if the files are deployed to the device with a different method, the absolute paths to the files on device can be used.

The `appContext` parameter is the Android application context - this is used to extract Picovoice resources from the APK. The Builder also allows you to override the default model files and/or the sensitivities:

```java
final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

PicovoiceManager manager = new PicovoiceManager.Builder()
    .setAccessKey(accessKey)
    .setKeywordPath("assets_sub_folder/keyword.ppn")
    .setWakeWordCallback(wakeWordCallback)
    .setContextPath("assets_sub_folder/context.rhn")
    .setInferenceCallback(inferenceCallback)
    .setPorcupineModelPath("assets_sub_folder/porcupine_model.pv")
    .setPorcupineSensitivity(0.7f)
    .setRhinoModelPath("assets_sub_folder/rhino_model.pv")
    .setRhinoSensitivity(0.35f)
    .setEndpointDurationSec(1.5f)
    .setRequireEndpoint(false)
    .setProcessErrorCallback(new PicovoiceManagerErrorCallback() {
        @Override
        public void invoke(final PicovoiceException e) {
            // error handling
        }
    })
    .build(appContext);
```

Sensitivity is the parameter that enables trading miss rate for the false alarm rate. It is a floating-point number within [0, 1]. A higher sensitivity reduces the miss rate at the cost of increased false alarm rate.

The model file contains the parameters for the associated engine. To change the language that the engine understands you'll have to provide a model file for that language. This should also be placed in the `assets` folder. Alternatively, if the model file is deployed to the device with a different method, the absolute path to the file on device can be used.

There is also the option to pass an error callback, which will be invoked if an error is encountered while PicovoiceManager is processing audio.

Once you have instantiated a PicovoiceManager, you can start audio capture and voice recognition by calling:
```java
manager.start();
```

Stop the manager with:

```java
manager.stop();
```

### Low-Level API

[Picovoice.java](./Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/Picovoice.java) provides a
low-level binding for Android. It can be initialized using the Picovoice Builder:

```java
import ai.picovoice.picovoice.*;

final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

try {
    Picovoice picovoice = new Picovoice.Builder()
        .setAccessKey(accessKey)
        .setKeywordPath("assets_sub_folder/keyword.ppn")
        .setPorcupineModelPath("assets_sub_folder/porcupine_model.pv")
        .setPorcupineSensitivity(0.6f)
        .setWakeWordCallback(new PicovoiceWakeWordCallback() {
            @Override
            public void invoke() {
                // logic to execute upon detection of wake word
            }
        })
        .setContextPath("assets_sub_folder/context.rhn")
        .setRhinoModelPath("assets_sub_folder/rhino_model.pv")
        .setRhinoSensitivity(0.4f)
        .setEndpointDurationSec(1.5f)
        .setRequireEndpoint(false)
        .setInferenceCallback(new PicovoiceInferenceCallback() {
            @Override
            public void invoke(final RhinoInference inference) {
                // logic to execute upon completion of intent inference
            }
        })
        .build(appContext);
} catch(PicovoiceException ex) { }
```

Sensitivity is the parameter that enables trading miss rate for the false alarm rate. It is a floating-point number within [0, 1]. A higher sensitivity reduces the miss rate at the cost of increased false alarm rate.

RequireEndpoint is the parameter which indicates if Rhino should wait for a moment of silence before inferring context. Default is set to true.

The model file contains the parameters for the associated engine. To change the language that the engine understands you'll have to provide a model file for that language.

Once initialized, `picovoice` can be used to process incoming audio.

```java
private short[] getNextAudioFrame();

while (true) {
    try {
        picovoice.process(getNextAudioFrame());
    } catch (PicovoiceException e) {
        // error handling logic
    }
}
```

For `process` to work correctly, the audio data must be in the audio format required by Picovoice.
The required audio format is found by calling `.getSampleRate()` to get the required sample rate and `.getFrameLength()` to get the required number of samples per input frame. Audio must be single-channel and 16-bit linearly-encoded.

Finally, be sure to explicitly release resources acquired as the binding class does not rely on the garbage collector
for releasing native resources.

```java
picovoice.delete();
```

## Custom Wake Word & Context Integration

To add a custom wake word (`.ppn`) or context (`.rhn`) file to your application, add the files to your assets folder (`src/main/assets`) and then pass the relative paths to the Picovoice Builder.

In this example our files are located in the assets folder under subdirectory `picovoice_files`:

```java
final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

try {
    Picovoice picovoice = new Picovoice.Builder()
                        .setAccessKey(accessKey)
                        .setKeywordPath("picovoice_files/keyword.ppn")
                        .setContextPath("picovoice_files/context.rhn")
                        .build(appContext);
} catch (PicovoiceException e) { }
```

Alternatively, if the files are deployed to the device with a different method, the absolute paths to the files on device can be used.

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demo Apps

For example usage refer to
[Activity demo](../../demo/android/Activity) or [Service demo](../../demo/android/Service).
