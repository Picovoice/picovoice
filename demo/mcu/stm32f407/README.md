# Picovoice STM32F407G-DISC1 Demo (Multiple languages)

This package contains a demo project for the STM32F407 Discovery kit using Picovoice platform.

## Supported Languages

1. English
2. German
3. French
4. Spanish


## Installation

For this demo, you need to: 
1. Download and install [STM32CubeIDE](https://www.st.com/en/development-tools/stm32cubeide.html), which is an all-in-one multi-OS development tool for STM32 microcontrollers.
2. Follow steps mentioned in [readme](./stm32f407g-disc1/Middlewares/ST/STM32_Audio/Addons/PDM/readme.txt) for STM32Cube middleware for audio PDM to PCM conversion.

## AccessKey

Picovoice requires a valid `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://picovoice.ai/console/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

## Usage

In the demo project, there is a separate build configuration for each supported languages. In order to activate a specific configuration:

1. Click `Project` > `Build Configuration` > `Set Active`
2. Select the target configuration

Then, to compile and run the demo project on a STM32F407 discovery board, perform the following steps:

1. Open STM32CubeIDE
2. Click `File` > `Open Projects from file system...` to display the `Import Projects` dialog box. Select the [stm32f407g-disc1](./stm32f407g-disc1) folder from this repository, and then press the `Finish` button.
3. Copy the `Inc` and `Lib` folders from the downloaded **PCM2PDM** library to [/Middlewares/ST/STM32_Audio/Addons/PDM](./stm32f407g-disc1/Middlewares/ST/STM32_Audio/Addons/PDM)
4. Replace `ACCESS_KEY` in `main.c` with your AccessKey obtained from [Picovoice Console](https://picovoice.ai/console/)
4. Click `Project` > `Build Project`
5. Connect the board to the computer and press `Run` > `Debug`.
  
> :warning: `printf()` uses the SWO connector and the trace port 0. For more information, refer to [STM32 microcontroller debug toolbox](https://www.st.com/resource/en/application_note/dm00354244-stm32-microcontroller-debug-toolbox-stmicroelectronics.pdf), Chapter 7.

The default wake word and context model for all supported languages are listed [here](../README.md)

## Create Custom Models

1. Copy the UUID of the board printed at the beginning of the session to the  Serial Wire Viewer (SWV).
1. Go to [Picovoice Console](https://console.picovoice.ai/) to create models for [Porcupine wake word engine](https://picovoice.ai/docs/quick-start/console-porcupine/) and [Rhino Speech-to-Intent engine](https://picovoice.ai/docs/quick-start/console-rhino/).
1. Select `Arm Cortex-M` as the platform when training the model.
1. Select `STM32` as the board type and provide the UUID of the chipset on the board.

The model is now being trained. You will be able to download it within a few hours.

## Import the Custom Models

1. Download your custom voice model(s) from [Picovoice Console](https://console.picovoice.ai/).
2. Decompress the zip file. The model file is either `.ppn` for Porcupine wake word or `.rhn` for Rhino Speech-to-Intent. Both zip archives also contain a `.h` header file containing the `C` array version of the binary model.
3. Copy the contents of the arrays inside the `.h` header files and update the `keyword_array` and `context_array` values in [/stm32f407g-disc1/Inc/pv_params.h](./stm32f407g-disc1/Inc/pv_params.h)  in the language section for which the model is trained.
