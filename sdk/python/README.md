# Picovoice

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

* Python 3
* Runs on Linux (x86_64), Mac (x86_64), Windows (x86_64), Raspberry Pi (all variants), and BeagleBone.

## Installation

```bash
pip3 install picovoice
```

## Usage

Create a new instance of Picovoice runtime engine

```python
from picovoice import Picovoice

keyword_path = ...

def wake_word_callback():
    pass

context_path = ...

def inference_callback(inference):
    # `inference` exposes three immutable fields:
    # (1) `is_understood`
    # (2) `intent`
    # (3) `slots`
    pass

handle = Picovoice(
        keyword_path=keyword_path,
        wake_word_callback=wake_word_callback,
        context_path=context_path,
        inference_callback=inference_callback)
```

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in the file located at
`keyword_path`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `context_path`. `keyword_path` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`context_path` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` suffix). `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is
invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `handle.sample_rate`. Expected number of audio samples per
frame is `handle.frame_length`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```python
def get_next_audio_frame():
    pass

while True:
    handle.process(get_next_audio_frame())
```

When done resources have to be released explicitly

```python
handle.delete()
```

## Demos

[picovoicedemo](https://pypi.org/project/picovoicedemo/) provides command-line utilities for processing real-time
audio (i.e. microphone) and files using Picovoice platform.
