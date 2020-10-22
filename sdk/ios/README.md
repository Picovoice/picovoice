[PicovoiceManager](/sdk/ios/PicovoiceManager.swift) class manages all activities related to creating an audio input
stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and completion of
intent inference. The class can be initialized as below:

```swift
let porcupineModelpath: String = ...
let keywordPath: String = ...
let porcupineSensitivity: Float32 = 0.5
let rhinoModelPath: String = ...
let contextPath: String = ...
let rhinoSensitivity: Float32 = 0.5
let manager = PicovoiceManager(
    porcupineModelpath: porcupineModelpath,
    keywordPath: keywordPath,
    porcupineSensitivity: porcupineSensitivity,
    onWakeWordDetection: {
        // logic to execute upon wake word detection.
    },
    rhinoModelPath: rhinoModelPath,
    contextPath: contextPath,
    rhinoSensitivity: rhinoSensitivity,
    onInference: {
        // logic to execute upon intent inference completion.
    }
)
```

when initialized input audio can be processed using `manager.start()`. The processing can be interrupted using
`manager.stop()`.
