# Picovoice Microcontroller Demos

This package provides demo projects for the following development boards:
- [STM32F407G-DISC1](/demo/mcu/stm32f407)
- [STM32F411E-DISCO](/demo/mcu/stm32f411)
- [STM32F469I-DISCO](/demo/mcu/stm32f469)
- [STM32F769I-DISCO](/demo/mcu/stm32f769)
- [STM32H735G-DK](/demo/mcu/stm32h735)
- [STM32H747I-DISCO](/demo/mcu/stm32h747)
- [IMXRT1050-EVKB](/demo/mcu/imxrt1050)
- [CY8CKIT-062S2-43012 (PSoC6)](https://github.com/Picovoice/picovoice-demo-psoc6)

## Usage

For these demos, the default wake word is `Picovoice` and the context is `Smart Lighting`. After uploading the firmware to the microcontroller, the engine can recognize commands such as:

> Picovoice, turn off the lights.

or

> Picovoice, set the lights in the bedroom to blue.

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
