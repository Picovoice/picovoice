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
    } catch (PorcupineException e) {
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