# Picovoice Python SDK Demos

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
sudo pip3 install picovoice
```

## Usage

Using a working microphone connected to your device run the following in the terminal

```bash
picovoice_demo_mic --keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} \
--context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```

```bash
picovoice_demo_file --input_audio_path ${PATH_TO_INPUT_AUDIO_FILE} \
--keyword_path ${PATH_TO_PORCUPINE_KEYWORD_FILE} --context_path ${PATH_TO_RHINO_CONTEXT_FILE)}
```
