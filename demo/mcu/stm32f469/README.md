
# Picovoice STM32F469I-DISCO Demo

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)


This package contains a demo project for STM32F469 Discovery kit using Picovoice platform.

## Installation

For this demo, you need to: 
1. Download and install [STM32CubeIDE](https://www.st.com/en/development-tools/stm32cubeide.html), which is an all-in-one multi-OS development tool for STM32 microcontrollers.
1. Download [STM32Cube middleware for audio PDM to PCM conversion](https://www.st.com/en/licensed-software/audiopdm-mw.html) and copy it to the project folder. A more detail guide can be found on [STM32CubeF4's GitHub repository](https://github.com/STMicroelectronics/STM32CubeF4/tree/master/Middlewares/ST/STM32_Audio/Addons/PDM).
1. Install a serial port monitor on your system to be able to communicate with the board. [Arduino environment's built-in serial monitor](https://www.arduino.cc/en/software) and [Coolterm](https://freeware.the-meiers.org/) are two free options that are also available on all platforms (Windows, Linux, and macOS).

## Usage

In order to compile and run the demo project on a STM32F469 discovery board, perform the following steps:

1. Open STM32CubeIDE
1. Click `File` > `Open Projects from file system...` to display the `Import Projects` dialog box. Select the `stm32f469i-disco` folder from this repository, and then press the "Finish" button.
1. Copy the `Inc` and `Lib` folders from the downloaded **PCM2PDM** library to `/Middlewares/ST/STM32_Audio/Addons/PDM`
1. Click `Project` > `Build All`
1. Connect the board to the computer and press `Run` > `Run`

For this demo, the default wake word is `Picovoice` and the context is `Smart Lighting`. The engine can recognize commands such as

> Picovoice, turn off the lights.

or

> Picovoice, set the lights in the bedroom to blue.

Picovoice's output can be seen on the serial port monitor.

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
## Create custom wake-word and context models

Copy the UUID of the board printed at the beginning of the session to the serial port monitor. 
Then, head to Picovoice Console, where you can easily create models for both <Link to="/docs/quick-start/console-porcupine/">Porcupine Wake Word Engine</Link> and <Link to="/docs/quick-start/console-rhino/">Rhino Speech-to-Intent Engine</Link>.

Once you are ready to train the model, choose "ARM Cortex-M" as the platform. Here, you are asked to select the board type and provide the UUID of the chipset on the board. Choose "STM32" as the board type and paste the UUID copied before. The model is now being trained. You will be able to download it within a few hours.

After downloading your personalized voice model, you need to extract the compressed zip file someplace on your computer. Using `binary_to_c_array.py`, available in this folder, to convert your binary models to C array format  following the below command

`python3 binary_to_c_array.py input_binary_model output_c_array.txt`

Now, you just need to copy the content of the output file and update the`keyword_array` and `context_array` values in `stm32f469i-disco/Inc/pv_params.h` header file.
