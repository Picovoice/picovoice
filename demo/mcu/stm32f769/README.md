# Picovoice STM32F769I-DISCO Demo

This package contains a demo project for the STM32F769 Discovery kit using Picovoice platform.

## Supported Languages

1. English
2. French
3. German
4. Spanish

## Installation

For this demo, you need to:

1. Download and install [STM32CubeIDE](https://www.st.com/en/development-tools/stm32cubeide.html), which is an
   all-in-one multi-OS development tool for STM32 microcontrollers.
2. Install a serial port monitor on your system to be able to communicate with the
   board. [Arduino environment's built-in serial monitor](https://www.arduino.cc/en/software)
   and [Coolterm](https://freeware.the-meiers.org/) are two free options available on all platforms (Windows, Linux, and
   macOS).

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using
Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

In the demo project, there is a separate build configuration for each supported languages. In order to activate a
specific configuration:

1. Click `Project` > `Build Configuration` > `Set Active`
2. Select the target configuration

Then, to compile and run the demo project on a STM32F769 discovery board, perform the following steps:

1. Open STM32CubeIDE
2. Click `File` > `Open Projects from file system...` to display the `Import Projects` dialog box. Select
   the [stm32f769i-disco](./stm32f769i-disco) folder from this repository, and then press the `Finish` button.
3. Replace `ACCESS_KEY` in `main.c` with your AccessKey obtained from [Picovoice Console](https://console.picovoice.ai/)
4. Click `Project` > `Build Project`
5. Connect the board to the computer and press `Run` > `Run`

In this demo, you can determine the default wake word and context models for each language by checking the [pv_params.h](./stm32f769i-disco/Inc/pv_params.h). Find the language section surrounded by:

```c
#if defined(__PV_LANGUAGE_{LANGUAGE_NAME}__)
...
#endif
```

The default wake word for each language can be found next to the `// wake-word` comment, and the default context is located beside the `// context` comment.

When the demo begins, the context information will be displayed on the console.

## Create Custom Models

1. Copy the UUID of the board printed at the beginning of the session to the serial port monitor.
2. Go to [Picovoice Console](https://console.picovoice.ai/) to create models
   for [Porcupine wake word engine](https://picovoice.ai/docs/quick-start/console-porcupine/)
   and [Rhino Speech-to-Intent engine](https://picovoice.ai/docs/quick-start/console-rhino/).
3. Select `Arm Cortex-M` as the platform when training the model.
4. Select `STM32` as the board type and provide the UUID of the chipset on the board.

The model is now being trained. You will be able to download it within a few hours.

## Import the Custom Models

1. Download your custom voice model(s) from [Picovoice Console](https://console.picovoice.ai/).
2. Decompress the zip file. The model file is either `.ppn` for Porcupine wake word or `.rhn` for Rhino
   Speech-to-Intent. Both zip archives also contain a `.h` header file containing the `C` array version of the binary
   model.
3. Copy the contents of the arrays inside the `.h` header files and update the `keyword_array` and `context_array`
   values in [/stm32f769i-disco/Inc/pv_params.h](./stm32f769i-disco/Inc/pv_params.h)  in the language section for which
   the model is trained.
