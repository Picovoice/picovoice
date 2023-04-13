# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences similar to Alexa and Google, but it runs entirely on-device.

Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
  [\*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.


## Requirements

- C99-compatible compiler
- CMake (3.4+)


## Compatibility

- Linux (x86_64)
- macOS (x86_64, arm64)
- Windows (x86_64)
- BeagleBone
- NVIDIA Jetson Nano
- Raspberry Pi (Zero, 2, 3, 4)


## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

Picovoice is implemented in ANSI C and therefore can be directly linked to C applications. Its public header file ([sdk/include/pv_picovoice.h](./include/pv_picovoice.h)) contains relevant information. An instance of the Picovoice object can be constructed as follows.

```c
const char* ACCESS_KEY = "${ACCESS_KEY}"; // AccessKey string obtained from [Picovoice Console](https://console.picovoice.ai/)

const char *porcupine_model_path = ... // Available at resources/porcupine/lib/common/porcupine_params.pv
const char *keyword_path = ...
const float porcupine_sensitivity = 0.5f;

const char *rhino_model_path = ... // Available at resources/rhino/lib/common/rhino_params.pv
const char *context_path = ...
const float rhino_sensitivity = 0.5f;
const bool require_endpoint = true;

static void wake_word_callback(void) {
    // take action upon detection of wake word
}

static void inference_callback(pv_inference_t *inference) {
    // `inference` exposes three immutable properties:
    // (1) `IsUnderstood`
    // (2) `Intent`
    // (3) `Slots`

    // take action based on inferred intent
    pv_inference_delete(inference);
}

pv_picovoice_t *handle = NULL;

pv_status_t status = pv_picovoice_init(
        access_key,
        porcupine_model_path,
        keyword_path,
        porcupine_sensitivity,
        wake_word_callback,
        rhino_model_path,
        context_path,
        rhino_sensitivity,
        require_endpoint,
        inference_callback,
        &handle);

if (status != PV_STATUS_SUCCESS) {
    // error handling logic
    
}
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating-point number
within [0, 1]. A higher sensitivity reduces miss rate (false reject rate) at cost of increased false alarm rate.

`handle` is an instance of Picovoice runtime engine that detects utterances of the wake phrase provided by `keyword_path`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within the context defined in `context_path`. `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is invoked upon completion of follow-on voice command inference.

Picovoice accepts single channel, 16-bit PCM audio. The sample rate can be retrieved using `pv_sample_rate()`. Finally, Picovoice accepts input audio in consecutive chunks
(aka frames) the length of each frame can be retrieved using `pv_porcupine_frame_length()`.

```c
extern const int16_t *get_next_audio_frame(void);

while (true) {
    const int16_t *pcm = get_next_audio_frame();
    const pv_status_t status = pv_picovoice_process(handle, pcm);
    if (status != PV_STATUS_SUCCESS) {
        // error handling logic
    }
}
```

Finally, when done be sure to release the acquired resources.

```c
pv_picovoice_delete(handle);
```


## Demos

Check out the [Picovoice demo for C](../../demo/c) to see what it looks like to use Picovoice in a C project!
