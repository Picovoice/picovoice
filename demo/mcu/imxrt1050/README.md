
# Picovoice IMXRT1050-EVKB Demo

This package contains a demo project for the i.MX RT1050 Evaluation Kit using Picovoice platform.

## Installation

For this demo, you need to download and install [MCUXpresso IDE](https://www.nxp.com/design/software/development-software/mcuxpresso-software-and-tools-/mcuxpresso-integrated-development-environment-ide:MCUXpresso-IDE), which is an all-in-one multi-OS development tool for NXP MCUs based on Arm Cortex-M cores.

## Usage

In order to compile and run the demo project on a i.MX RT1050 Evaluation board, perform the following steps:

1. Open `MCUXpresso IDE`
2. From the main toolbar, select `Install MCUXpresso SDKs` and install `evkbimxrt1050` SDK
3. Click `File` > `Open Projects from file system...` to display the `Import Projects` dialog box. Select the [imxrt1050-evkb](./imxrt1050-evkb) folder from this repository, and then press the `Finish` button.
4. Click `Project` > `Build All`
5. Connect the board to the computer, select the imported project inside `Project Explorer` window
6. Click `Run` > `Debug as` > `MCUXpresso IDE LinkServer probes` and then select the connected board.
7. In the debug view, press `Run` > `Resume`

For this demo, the default wake word is `Picovoice` and the context is `Smart Lighting`. The engine can recognize commands such as

> Picovoice, turn off the lights.

or

> Picovoice, set the lights in the bedroom to blue.

Picovoice's output can be seen on the IDE console.

See below for the full context:

```yaml
context:
  expressions:
    changeColor:
      - "[turn, make] (all, the) lights $color:color"
      - "[change, set, switch] (all, the) lights to $color:color"
      - "[turn, make] (the) $location:location (color, light, lights) $color:color"
      - "[change, set, switch] (the) $location:location (color, light, lights) to $color:color"
      - "[turn, make] (the) [color, light, lights] [at, in] (the) $location:location $color:color"
      - "[change, set, switch] (the) [color, light, lights] [at, in] (the) $location:location to $color:color"
      - "[turn, make] (the) [color, light, lights] $color:color [at, in] (the) $location:location"
      - "[change, set, switch] (the) [color, light, lights] to $color:color [at, in] (the) $location:location"
    changeLightState:
      - "[switch, turn] $state:state (all, the) lights"
      - "[switch, turn] (all, the) lights $state:state"
      - "[switch, turn] $state:state (the) $location:location (light, lights)"
      - "[switch, turn] (the) $location:location [light, lights] $state:state"
      - "[switch, turn] $state:state (the) [light, lights] [at, in] (the) $location:location"
      - "[switch, turn] (the) [light, lights] [in, at] the $location:location $state:state"
    changeLightStateOff:
      - "shut off (all, the) lights"
      - "shut (all, the) lights off"
      - "shut off (the) $location:location (light, lights)"
      - "shut (the) $location:location (light, lights) off"
      - "shut off (the) [light, lights] [at, in] (the) $location:location"
      - "shut (the) [light, lights] off [at, in] (the) $location:location"
      - "shut (the) [light, lights] [at, in] (the) $location:location off"
  slots:
    color:
      - "blue"
      - "green"
      - "orange"
      - "pink"
      - "purple"
      - "red"
      - "white"
      - "yellow"
    state:
      - "off"
      - "on"
    location:
      - "bathroom"
      - "bedroom"
      - "closet"
      - "hallway"
      - "kitchen"
      - "living room"
      - "pantry"
```
## Create Custom Models

1. Copy the UUID of the board printed at the beginning of the session to the IDE console.
1. Go to [Picovoice Console](https://console.picovoice.ai/) to create models for [Porcupine wake word engine](https://picovoice.ai/docs/quick-start/console-porcupine/) and [Rhino Speech-to-Intent engine](https://picovoice.ai/docs/quick-start/console-rhino/).
1. Select `Arm Cortex-M` as the platform when training the model.
1. Select `IMXRT` as the board type and provide the UUID of the chipset on the board.

The model is now being trained. You will be able to download it within a few hours.

## Import the Custom Models

1. Download your custom voice model(s) from [Picovoice Console](https://console.picovoice.ai/).
1. Decompress the zip file. The model file is either `.ppn` for Porcupine wake word or `.rhn` for Rhino Speech-to-Intent.
1. Use [binary_to_c_array.py](https://github.com/Picovoice/picovoice/tree/master/resources/scripts/binary_to_c_array.py) to convert your binary models to C array format  utilizing the following command:
`python3 binary_to_c_array.py input_binary_model output_c_array.txt`
1. Copy the content of `output_c_array.txt` and update the `keyword_array` and `context_array` values in [imxrt1050-evkb/inc/pv_params.h](./imxrt1050-evkb/inc/pv_params.h).
 
