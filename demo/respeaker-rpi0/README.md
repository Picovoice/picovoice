## Requirements

```console
sudo apt-get install wiringpi
```

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Build

From the root of the repository run:

```console
gcc -std=c99 -O3 -o demo/respeaker-rpi0/picovoice_demo_mic \
-I sdk/c/include/ demo/respeaker-rpi0/picovoice_demo_mic.c \
-ldl -lasound -lwiringPi
```

## Run

From the root of the repository run:

```console
./demo/respeaker-rpi0/picovoice_demo_mic \
-l sdk/c/lib/raspberry-pi/arm11/libpicovoice.so \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/raspberry-pi/picovoice_raspberry-pi.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c demo/respeaker/pvrespeakerdemo/respeaker_raspberry-pi.rhn \
-i plughw:CARD=seeed2micvoicec,DEV=0
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

The list of commands is shown below:

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
