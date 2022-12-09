# Picovoice SDK for iOS

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

## Installation

The Picovoice iOS SDK is available via [Cocoapods](https://cocoapods.org). To import it into your iOS project install Cocoapods and add the following line to your Podfile:

```ruby
pod 'Picovoice-iOS'
```

## Permissions

To enable recording with your iOS device's microphone you must add the following to your app's `Info.plist` file:
```xml
<key>NSMicrophoneUsageDescription</key>
<string>[Permission explanation]</string>
```

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

There are two possibilities for integrating Picovoice into an iOS application.

### High-Level API

[PicovoiceManager](./PicovoiceManager.swift) provides
a high-level API for integrating Picovoice into iOS applications. It manages all activities related to creating an input audio stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and
inference completion. To construct a PicovoiceManager you'll need to provide a Picovoice `AccessKey`, a Porcupine keyword file (.ppn) and a Rhino context file (.rhn).

```swift
import Picovoice

let accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

let manager = PicovoiceManager(
    accessKey: accessKey,
    keywordPath: "/path/to/keyword.ppn",
    onWakeWordDetection: {
        // logic to execute upon detection of wake word
    },
    contextPath: "/path/to/context.rhn",
    onInference: { inference in
        // logic to execute upon completion of intent inference
    })
```

The constructor also allows you to override the default model files and/or the sensitivities of Porcupine and Rhino:

```swift
let accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

let manager = PicovoiceManager(
    accessKey: accessKey,
    keywordPath: "/path/to/keyword.ppn",
    porcupineSensitivity: 0.4,
    porcupineModelPath: "/path/to/porcupine/model.pv",
    onWakeWordDetection: wakeWordCallback,
    contextPath: "/path/to/context.rhn",
    rhinoSensitivity: 0.7,
    rhinoModelPath: "/path/to/rhino/model.pv",
    onInference: inferenceCallback,
    endpointDurationSec: 1.5,
    requireEndpoint: false)
```

Sensitivity is the parameter that enables trading miss rate for the false alarm rate. It is a floating-point number within [0, 1]. A higher sensitivity reduces the miss rate at the cost of increased false alarm rate.

The model file contains the parameters for the associated engine. To change the language that the engine understands you'll have to provide a model file for that language.

Once you have instantiated a PicovoiceManager, you can start audio capture and voice recognition by calling:

```swift
do {
    try manager.start()
} catch { }
```

Stop the manager with:
```swift
manager.stop();
```

### Low-Level API

[Picovoice.swift](./Picovoice.swift) provides an API for passing audio from your own audio pipeline into the Picovoice Platform for wake word detection and intent inference.

To construct an instance, you'll need to provide a Picovoice `AccessKey`, a Porcupine keyword file (.ppn), a Rhino context file (.rhn) and callbacks for when the wake word is detected and an inference is made. Sensitivity and model parameters are optional

```swift
import Picovoice

let accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

do {
    let picovoice = try Picovoice(
        accessKey: accessKey,
        keywordPath: "/path/to/keyword.ppn",
        porcupineSensitivity: 0.4,
        porcupineModelPath: "/path/to/porcupine/model.pv",
        onWakeWordDetection: {
            // logic to execute upon detection of wake word
        },
        contextPath: "/path/to/context.rhn",
        rhinoSensitivity: 0.7,
        rhinoModelPath: "/path/to/rhino/model.pv",
        endpointDurationSec: 1.5,
        requireEndpoint: false,
        onInference: { inference in
            // logic to execute upon completion of intent inference
        })
} catch { }
```

Sensitivity is the parameter that enables trading miss rate for the false alarm rate. It is a floating-point number within [0, 1]. A higher sensitivity reduces the miss rate at the cost of increased false alarm rate.

The model file contains the parameters for the associated engine. To change the language that the engine understands you'll have to provide a model file for that language.

Once initialized, `picovoice` can be used to process incoming audio. The underlying logic of the class will handle switching between wake word detection and intent inference, as well as invoking the associated events.

```swift
func getNextAudioFrame() -> [Int16] {
    // .. get audioFrame
    return audioFrame;
}

while (true) {
    do {
        try picovoice.process(getNextAudioFrame());
    } catch { }
}
```

For `process` to work correctly, the audio data must be in the audio format required by Picovoice. The required audio format is found by using `Picovoice.sampleRate` to get the required sample rate and `Picovoice.frameLength` to get the required number of samples per input frame. Audio must be single-channel and 16-bit linearly-encoded.

Once you're done with an instance of Picovoice you can force it to release its native resources rather than waiting for the garbage collector:

```swift
picovoice.delete();
```

## Custom Model Integration

To add custom models to your iOS application you must include them in your app as a bundled resource (found by selecting in Build Phases > Copy Bundle Resources). Then in code, get the file paths like so:

```swift
// files are called 'keyword_ios.ppn' and 'context_ios.rhn'
let keywordPath = Bundle.main.path(forResource: "keyword_ios", ofType: "ppn")
let contextPath = Bundle.main.path(forResource: "context_ios", ofType: "rhn")
```

Alternatively, if the custom models are deployed to the device with a different method, the absolute paths to the files on device can be used.

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Running Unit Tests

Copy your `AccessKey` into the `accessKey` variable in [`PicovoiceAppTestUITests.swift`](PicovoiceAppTest/PicovoiceAppTestUITests/PicovoiceAppTestUITests.swift). Open `PicovoiceAppTest.xcworkspace` with XCode and run the tests with `Product > Test`.

## Demo Apps

For example usage refer to our [iOS demo application](../../demo/ios).
