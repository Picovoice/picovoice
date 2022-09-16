# Picovoice SDK for Rust

## Picovoice
Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

- Rust 1.54+
- Runs on Linux (x86_64), macOS (x86_64 and arm64), Windows (x86_64), Raspberry Pi, NVIDIA Jetson (Nano), and BeagleBone

## Installation
First you will need [Rust and Cargo](https://rustup.rs/) installed on your system.

To add the picovoice library into your app, add `picovoice` to your app's `Cargo.toml` manifest:
```toml
[dependencies]
picovoice = "*"
```

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

To create an instance of the engine with default parameters, use the `PicovoiceBuilder` function.
You must provide a Porcupine keyword file, a wake word detection callback function, a Rhino context file and an inference callback function.
You must then make a call to `init()`:

```rust
use picovoice::{rhino::RhinoInference, PicovoiceBuilder};

let access_key = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

let wake_word_callback = || {
    // let user know wake word detected
};
let inference_callback = |inference: RhinoInference| {
    if inference.is_understood {
        let intent = inference.intent.unwrap();
        let slots = inference.slots;
        // add code to take action based on inferred intent and slot values
    } else {
        // add code to handle unsupported commands
    }
};

let mut picovoice = PicovoiceBuilder::new(
    access_key,
    keyword_path,
    wake_word_callback,
    context_path,
    inference_callback,
).init().expect("Failed to create picovoice");
```

Upon detection of wake word defined by `keyword_path` it starts inferring user's intent
from the follow-on voice command within the context defined by the file located at `context_path`.
`keyword_path` is the absolute path to [Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`context_path` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file (with `.rhn` suffix).
`wake_word_callback` is invoked upon the detection of wake phrase and
`inference_callback` is invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `sample_rate()`.
Expected number of audio samples per frame is `frame_length()`.
The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```rust
fn next_audio_frame() -> Vec<i16> {
    // get audio frame
}

loop {
    picovoice.process(&next_audio_frame()).expect("Picovoice failed to process audio");
}
```

The sensitivity of the Porcupine (wake word) and Rhino (inference) engines can be tuned
using the `porcupine_sensitivity()` and `rhino_sensitivity()` methods respectively.
They are floating point numbers within [0, 1].
A higher sensitivity value results in fewer misses at the cost of (potentially) increasing the erroneous inference rate:

```rust
let access_key = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

let mut picovoice = PicovoiceBuilder::new(
    access_key,
    keyword_path,
    wake_word_callback,
    context_path,
    inference_callback,
)
.porcupine_sensitivity(0.4f32)
.rhino_sensitivity(0.77f32)
.init().expect("Failed to create picovoice");
```

Non-standard model and library paths (For example, when using a non-english model) for both engines can be tuned in a similar manner:

```rust
let access_key = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

let mut picovoice = PicovoiceBuilder::new(
    access_key,
    keyword_path,
    wake_word_callback,
    context_path,
    inference_callback,
)
.porcupine_sensitivity(0.4f32)
.rhino_sensitivity(0.77f32)
.porcupine_model_path("path/to/model/params.pv")
.rhino_model_path("path/to/model/params.pv")
.porcupine_library_path("path/to/library.so")
.rhino_library_path("path/to/library.so")
.init().expect("Failed to create picovoice");
```

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demos

Check out the Picovoice Rust demos [here](../../demo/rust)
