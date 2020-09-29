# Picovoice Python SDK

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs on-device. Picovoice is


- **Private:** Everything is processed on-device. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without relying on connectivity or external service availability.
- **Responsive:** Edge-first architecture eliminates unpredictable network delay.
- **Highly-Accurate:** Resilient to noise and reverberation. Outperforms cloud-based solutions with high margins.
- **Cross-Platform:** Build on your platforms of choice, with tools your team is accustomed to.
- **Cost-Effective:** Avoid unbounded cloud fees by processing locally with minimal resources.

## Compatibility

* Python 3
* Runs on Linux (x86_64), Mac (x86_64), Windows (x86_64), Raspberry Pi (all variants), and BeagleBone.

## Installation

```bash
pip3 install picovoice
```

## Usage

Create a new instance of Picovoice platform as below. `keyword_path` is the absolute path to
[Porcupine Wake Word Engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix). `context_path`
is the absolute path to [Rhino Speech-to-Intent Engine] context file (with `.rhn` suffix). `wake_word_callback` is
invoked upon the detection of wake phrase and `inference_callback` is called upon completion of follow-on voice command
inference.

```python
from picovoice import Picovoice

keyword_path = ...

def wake_word_callback():
    pass

context_path = ...

def inference_callback(is_understood, intent, slot_values):
    pass

pv = Picovoice(
        keyword_path=keyword_path,
        wake_word_callback=wake_word_callback,
        context_path=context_path,
        inference_callback=inference_callback)
```

When instantiated, valid sample rate can be obtained via `pv.sample_rate`. Expected number of audio samples per frame is
`pv.frame_length`. The incoming audio can be processed as below

```python
def get_next_audio_frame():
    pass

while True:
    pv.process()
```

Finally, when done be sure to explicitly release the resources.

```python
pv.delete()
```

## References

* [File Demo](/demo/python/picovoice_demo_file.py) 
* [Microphone Demo](/demo/python/picovoice_demo_mic.py)
