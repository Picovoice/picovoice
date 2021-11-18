# Picovoice SDK for Go

## Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

- Go 1.16+
- Runs on Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64), Raspberry Pi, NVIDIA Jetson (Nano) and BeagleBone

## AccessKey

Picovoice requires a valid `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

## Installation

```console
go get github.com/Picovoice/picovoice/sdk/go
```

Depending on your setup you also may need to run `go mod tidy` after in order to download transitive dependencies.

## Usage

To create an instance of the engine with default parameters, use the `NewPicovoice` function. You must provide a Porcupine keyword file, a wake word detection callback function, a Rhino context file and a inference callback function. You must then make a call to `Init()`.

```go
. "github.com/Picovoice/picovoice/sdk/go"
rhn "github.com/Picovoice/rhino/binding/go"

const accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

keywordPath := "/path/to/keyword/file.ppn"
wakeWordCallback := func(){
    // let user know wake word detected
}

contextPath := "/path/to/keyword/file.rhn"
inferenceCallback := func(inference rhn.RhinoInference){
    if inference.IsUnderstood {
            intent := inference.Intent
            slots := inference.Slots
        // add code to take action based on inferred intent and slot values
    } else {
        // add code to handle unsupported commands
    }
}

picovoice := NewPicovoice(
    accessKey,
    keywordPath, 
    wakeWordCallback, 
    contextPath, 
    inferenceCallback)

err := picovoice.Init()
if err != nil {
    // handle error
}
```

Upon detection of wake word defined by `keywordPath` it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `contextPath`. `accessKey` is your Picovoice `AccessKey`. `keywordPath` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` suffix). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `SampleRate`. Expected number of audio samples per
frame is `FrameLength`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```go
func getNextFrameAudio() []int16{
    // get audio frame
}

for {
    err := picovoice.Process(getNextFrameAudio())
}
```

When done resources have to be released explicitly

```go
picovoice.Delete()
```

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demos

Check out the Picovoice Go demos [here](/demo/go)


