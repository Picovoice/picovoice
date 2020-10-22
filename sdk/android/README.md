There are two possibilities for integrating Picovoice into an Android application.

## Low-Level API

[Picovoice.java](/sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/Picovoice.java) provides a
low-level binding for Android. It can be initialized using

```java
import ai.picovoice.picovoice.Picovoice;

final String porcupineModelPath = ...
final String keywordPath = ...
final float porcupineSensitivity = 0.5f;
final String rhinoModelPath = ...
final String contextPath = ...
final float rhinoSensitivity = 0.5f;

Picovoice picovoice = new Picovoice(
    porcupineModelPath,
    keywordPath,
    porcupineSensitivity,
    new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            // logic to execute upon deletection of wake word
        }
    },
    rhinoModelPath,
    contextPath,
    rhinoSensitivity,
    new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            // logic to execute upon completion of intent inference
        }
    }
);
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating number within
[0, 1]. A higher sensitivity reduces miss rate at cost of increased false alarm rate.

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

Finally, be sure to explicitly release resources acquired as the binding class does not rely on the garbage collector
for releasing native resources.

```java
picovoice.delete();
```

## High-Level API

[PicovoiceManager](/sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/PicovoiceManager.java) provides
a high-level API for integrating Picovoice into Android applications. It manages all activities related to creating an
input audio stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and
inference completion. The class can be initialized as follow

```java
import ai.picovoice.picovoice.PicovoiceManager;

final String porcupineModelPath = ...
final String keywordPath = ...
final float porcupineSensitivity = 0.5f;
final String rhinoModelPath = ...
final String contextPath = ...
final float rhinoSensitivity = 0.5f;

PicovoiceManager manager = new PicovoiceManager(
    porcupineModelPath,
    keywordPath,
    porcupineSensitivity,
    new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            // logic to execute upon deletection of wake word
        }
    },
    rhinoModelPath,
    contextPath,
    rhinoSensitivity,
    new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            // logic to execute upon completion of intent inference
        }
    }
);
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating number within
[0, 1]. A higher sensitivity reduces miss rate at cost of increased false alarm rate.

When initialized, input audio can be processed using 

```java
manager.start();
```

Stop the manager by

```java
manager.stop();
```

When done be sure to release resources using

```java
manager.delete();
```
