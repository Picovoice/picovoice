# Picovoice Microcontroller Demos (multiple languages)

This package provides demo projects for the following development boards:

- [STM32F407G-DISC1](stm32f407)
- [STM32F411E-DISCO](stm32f411)
- [STM32F769I-DISCO](stm32f769)
- [IMXRT1050-EVKB](imxrt1050)

You can also find packages for specific Arduino boards by searching for `picovoice` in the Arduino library manager.

## Usage

In these demos, you can determine the default wake word and context models for each language by checking the `pv_params.h` file inside each demo project. Find the language section surrounded by:

```c
#if defined(__PV_LANGUAGE_{LANGUAGE_NAME}__)
...
#endif
```

The default wake word for each language can be found next to the `// wake-word` comment, and the default context is located beside the `// context` comment.

When the demo begins, the context information will be displayed on the console.

In case of English version, after uploading the firmware to the microcontroller, the engine can recognize commands such as:

> Picovoice, turn off the lights.

or

> Picovoice, set the lights in the bedroom to blue.
