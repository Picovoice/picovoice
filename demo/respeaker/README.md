# Picovoice ReSpeaker Demo

[![GitHub release](https://img.shields.io/github/release/Picovoice/Picovoice.svg)](https://github.com/Picovoice/picovoice/releases)

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

This package contains a commandline demo for controlling ReSpeaker 4-mic microphone array LEDs using Picovoice.

## Picovoice

Picovoice is an end-to-end platform for building voice products on your terms. It enables creating voice experiences
similar to Alexa and Google. But it entirely runs 100% on-device. Picovoice is

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Installation

Follow the instructions on [Seeed Studio](https://wiki.seeedstudio.com/ReSpeaker_4_Mic_Array_for_Raspberry_Pi/)
to install and set up the microphone array.

Then install the demo:

```console
sudo pip3 install pvrespeakerdemo
```

## AccessKey

Picovoice requires a valid `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

## Usage

Run the demo:

```console
picovoice_respeaker_demo --access_key ${ACCESS_KEY}
```

Say

> Picovoice

The demo outputs:

```text
[wake word]
```

Say

>turn on the lights

You should see the lights turned on and the following message in the terminal:

```text
{
    is_understood : 'true',
    intent : 'turnLights',
    slots : {
        'state' : 'on',
    }
}
```

The list of commands are shown on the terminal:

```text
context:
  expressions:
    turnLights:
      - "[switch, turn] $state:state (all) (the) [light, lights]"
      - "[switch, turn] (all) (the) [light, lights] $state:state"
    changeColor:
      - "[change, set, switch] (all) (the) (light, lights) (color) (to) $color:color"
  slots:
    state:
      - "off"
      - "on"
    color:
      - "blue"
      - "green"
      - "orange"
      - "pink"
      - "purple"
      - "red"
      - "white"
      - "yellow"
```

Try changing the color by:

> Picovoice, set the lights to orange


Turn off the lights by:

> Picovoice, turn off all lights
