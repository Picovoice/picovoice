This document outlines how to use Picovoice platform on a microcontroller using the Picovoice C API.

## Compatibility

* Arm Cortex-M4 & M7

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

Picovoice is implemented in ANSI C and therefore can be directly linked to embedded C projects. Its public header file contains relevant information. An instance of the Picovoice object can be constructed as follows.

```c
#define MEMORY_BUFFER_SIZE ...

static const char* ACCESS_KEY = ... //AccessKey string obtained from [Picovoice Console](https://console.picovoice.ai/)

static uint8_t memory_buffer[MEMORY_BUFFER_SIZE] __attribute__((aligned(16)));

static const uint8_t *keyword_array = ...
const float porcupine_sensitivity = 0.5f

static void wake_word_callback(void) {
    // logic to execute upon detection of wake word
}

static const uint8_t *context_array = ...
const float rhino_sensitivity = 0.75f

static void inference_callback(pv_inference_t *inference) {
    // `inference` exposes three immutable properties:
    // (1) `IsUnderstood`
    // (2) `Intent`
    // (3) `Slots`
    // ..
    pv_inference_delete(inference);
}

pv_picovoice_t *handle = NULL;

const pv_status_t status = pv_picovoice_init(
        ACCESS_KEY,
        MEMORY_BUFFER_SIZE,
        memory_buffer,
        sizeof(keyword_array),
        keyword_array,
        porcupine_sensitivity,
        wake_word_callback,
        sizeof(context_array),
        context_array,
        rhino_sensitivity,
        true,
        inference_callback,
        &handle);

if (status != PV_STATUS_SUCCESS) {
    // error handling logic
}
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating-point number
within [0, 1]. A higher sensitivity reduces miss rate (false reject rate) at cost of increased false alarm rate.

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in `keyword_array`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within the context defined in `context_array`. `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is invoked upon completion of follow-on voice command inference.

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

Check out the [Picovoice demo for microcontrollers](../../demo/mcu) to see what it looks like to use Picovoice in an embedded project!
