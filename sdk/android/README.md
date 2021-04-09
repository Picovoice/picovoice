# Picovoice SDK for Android

## Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. 

Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Installation

Porcupine can be found on Maven Central. To include the package in your Android project, ensure you have included `mavenCentral()` in your top-level `build.gradle` file and then add the following to your app's `build.gradle`:

```groovy
dependencies {
    // ...
    implementation 'ai.picovoice:picovoice-android:1.1.0'
}
```
## Permissions

To enable recording with your Android device's microphone you must add the following line to your `AndroidManifest.xml` file:
```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
```

## Usage

There are two possibilities for integrating Picovoice into an Android application.

### High-Level API

[PicovoiceManager](/sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/PicovoiceManager.java) provides
a high-level API for integrating Picovoice into Android applications. It manages all activities related to creating an
input audio stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and
inference completion. The class can be initialized using the PicovoiceManager Builder:

```java
import ai.picovoice.picovoice.*;

PicovoiceManager manager = new PicovoiceManager(    
    .setKeywordPath("path/to/keyword/file.ppn")    
    .setWakeWordCallback(new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            // logic to execute upon deletection of wake word
        }
    })    
    .setContextPath("path/to/context/file.rhn")
    .setInferenceCallback(new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            // logic to execute upon completion of intent inference
        }
    })
    .build(appContext);
);
```

The `appContext` parameter is the Android application context - this is used to extract Picovoice resources from the APK. The Builder also allows you to override the default model files and/or the sensitivities:

```java
PicovoiceManager manager = new PicovoiceManager(    
    .setKeywordPath("path/to/keyword/file.ppn")
    .setWakeWordCallback(wakeWordCallback)    
    .setContextPath("path/to/context/file.rhn")
    .setInferenceCallback(inferenceCallback)
    .setPorcupineModelPath("path/to/porcupine/model.pv")
    .setPorcupineSensitivity(0.7f)
    .setRhinoModelPath("path/to/rhino/model.pv")
    .setRhinoSensitivity(0.35f)
    .build(appContext);
);
```

Sensitivity is the parameter that enables trading miss rate for the false alarm rate. It is a floating-point number within [0, 1]. A higher sensitivity reduces the miss rate at the cost of increased false alarm rate. 

The model file contains the parameters for the associated engine. To change the language that the engine understands you'll have to provide a model file for that language.

Once you have instantiated a PicovoiceManager, you can start audio capture and voice recognition by calling:
```java
manager.start();
```

Stop the manager with:

```java
manager.stop();
```

### Low-Level API

[Picovoice.java](/sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/Picovoice.java) provides a
low-level binding for Android. It can be initialized using the Picovoice Builder:

```java
import ai.picovoice.picovoice.*;

final String porcupineModelPath = ...
final String keywordPath = ...
final float porcupineSensitivity = 0.5f;
final String rhinoModelPath = ...
final String contextPath = ...
final float rhinoSensitivity = 0.5f;

try {
    Picovoice picovoice = new Picovoice.Builder()
        .setPorcupineModelPath(porcupineModelPath)
        .setKeywordPath(keywordPath)
        .setPorcupineSensitivity(porcupineSensitivity)
        .setWakeWordCallback(new PicovoiceWakeWordCallback() {
            @Override
            public void invoke() {
                // logic to execute upon deletection of wake word
            }
        })
        .setRhinoModelPath(rhinoModelPath)
        .setContextPath(contextPath)
        .setRhinoSensitivity(rhinoSensitivity)
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

## How to Integrate Custom Model Files (.ppn and .rhn files)

To add a custom model to your Android application a couple of extra steps must be taken. First, add your model file to the `/res/raw` folder. All resources are compressed when the build system creates an APK, so you will have to extract your file first before using it:

```java
try (
        InputStream is = new BufferedInputStream(
            getResources().openRawResource(R.raw.keyword), 256);
        OutputStream os = new BufferedOutputStream(
            openFileOutput(modelFileName, Context.MODE_PRIVATE), 256)
) {
    int r;
    while ((r = is.read()) != -1) {
        os.write(r);
    }
    os.flush();
}
```

## Non-English Contexts

In order to run inference on non-English contexts you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demo Apps

For example usage refer to
[Activity demo](/demo/android/Activity) or [Service demo](/demo/android/Service).