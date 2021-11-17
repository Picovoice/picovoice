# Picovoice Microcontroller Demos (multiple languages)

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

For these demos, the default wake words and the context are:

| Language | Wake word        | Context                 |
|----------|------------------|-------------------------|
| English  | Picovoice        | Smart lighting          |
| German   | Hey computer     | Beleuchtung             |
| Spanish  | Hola computadora | Iluminación inteligente |
| French   | Salut ordinateur | éclairage intelligent   |

In case of English version, after uploading the firmware to the microcontroller, the engine can recognize commands such as:

> Picovoice, turn off the lights.

or

> Picovoice, set the lights in the bedroom to blue.

See below for the full contexts:

### English context

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

### German context

```yaml
context:
  expressions:
    changeColor:
      - "[färbe, ändere, mache] (alle, die, das) [Licht, Lichter] (zu, in)
        $color:color"
      - "[färbe, ändere, mache] (alle, die, das) (Licht, Lichter) (im)
        $location:location (Licht, Lichter) (zu, in) $color:color"
    changeState:
      - (Mache) (alle, die, das) [Licht, Lichter] $state:state
      - (Mache) (alle, die, das) $location:location [Licht, Lichter] $state:state
      - (Mache) (alle, die, das) [Licht, Lichter] im $location:location
        $state:state
  slots:
    color:
      - blau
      - grün
      - orange
      - pink
      - lila
      - rot
      - weiß
      - gelb
    state:
      - an
      - aus
    location:
      - Badezimmer
      - Schlafzimmer
      - Kinderzimmer
      - Flur
      - Küche
      - Wohnzimmer
      - Speisekammer
```

### Spanish context

```yaml
context:
  expressions:
    changeColor:
      - haz que las luces sean $color:color
      - cambia las luces a $color:color
      - haz que [la, las] [luz, luces] [del, de la, en el, en la]
        $location:location [sea, sean] $color:color
      - cambia [la, las] [luz, luces] [del, de la, en el, en la]
        $location:location a $color:color
      - haz que [sea, sean] $color:color [la, las] [luz, luces] [del, de la, en
        el, en la] $location:location
      - cambia a $color:color [la, las] [luz, luces] [del, de la, en el, en la]
        $location:location
    changeLightState:
      - $action:action (todas) las luces
      - $action:action (la, las) [luz, luces] [del, de la, en el, en la]
        $location:location
  slots:
    color:
      - azul
      - verde
      - rosado
      - morado
      - rojo
      - blanco
      - amarillo
    location:
      - baño
      - armario
      - cocina
      - sala
      - despensa
      - dormitorio
      - habitación
      - pasillo
    action:
      - encienda
      - apaga
```

### French context

```yaml
context:
  expressions:
    changeColor:
      - "[Mets, Mettez, Allume, Allumez, Change, Changez] [les, la] [lumières, lumière] (en) $color:color"
      - "[Mets, Mettez, Allume, Allumez, Change, Changez] [les, la] [lumières, lumière] [du, de la, dans la, dans le] $location:location (en) $color:color"
    changeLightStateOff:
      - "[Éteins, Éteignez] [les, la] [lumières, lumière]"
      - "[Éteins, Éteignez] [les, la] [lumières, lumière] [du, de la] $location:location"
      - "[Éteins, Éteignez] [les, la] [lumières, lumière] [dans la, dans le] $location:location"
    changeLightStateOn:
      - "[Allume, Allumez] [les, la] [lumières, lumière]"
      - "[Allume, Allumez] [les, la] [lumières, lumière] [du, de la] $location:location"
      - "[Allume, Allumez] [les, la] [lumières, lumière] [dans la, dans le, dans l'] $location:location"
  slots:
    color:
      - bleu
      - vert
      - orange
      - rose
      - violet
      - rouge
      - blanc
      - jaune
    location:
      - salle de bain
      - toilettes
      - chambre
      - chambre à coucher
      - penderie
      - placard
      - couloir
      - cuisine
      - salle de séjour
      - salon
      - garde manger
```
