# Picovoice IMXRT1050-EVKB Demo (Multiple languages)

This package contains a demo project for the i.MX RT1050 Evaluation Kit using Picovoice platform.

## Supported Languages

1. Arabic
2. Dutch
3. English
4. French
5. German
6. Hindi
7. Italian
8. Japanese
9. Korean
10. Mandarin
11. Polish
12. Portuguese
13. Russian
14. Spanish
15. Swedish
16. Vietnamese

- Support for additional languages is available for commercial customers on a case-by-case basis.

## Installation

For this demo, you need to download and install [MCUXpresso IDE](https://www.nxp.com/design/software/development-software/mcuxpresso-software-and-tools-/mcuxpresso-integrated-development-environment-ide:MCUXpresso-IDE), which is an all-in-one multi-OS development tool for NXP MCUs based on Arm Cortex-M cores.

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

In the demo project, there is a separate build configuration for each supported languages. In order to activate a specific configuration:

1. Click `Project` > `Build Configuration` > `Set Active`
2. Select the target configuration

Then, to compile and run the demo project on an i.MX RT1050 Evaluation board, perform the following steps:

1. Open `MCUXpresso IDE`
2. From the main toolbar, select `Install MCUXpresso SDKs` and install `evkbimxrt1050` SDK
3. Click `File` > `Open Projects from file system...` to display the `Import Projects` dialog box. Select the [imxrt1050-evkb](./imxrt1050-evkb) folder from this repository, and then press the `Finish` button.
4. Replace `ACCESS_KEY` in `main.c` with your AccessKey obtained from [Picovoice Console](https://console.picovoice.ai/)
5. Click `Project` > `Build Project`
6. Connect the board to the computer, select the imported project inside `Project Explorer` window
7. Click `Run` > `Debug as` > `MCUXpresso IDE LinkServer probes` and then select the connected board.
8. In the debug view, press `Run` > `Resume`

In this demo, you can determine the default wake word and context models for each language by checking the [pv_params.h](./imxrt1050-evkb/inc/pv_params.h). Find the language section surrounded by:

```c
#if defined(__PV_LANGUAGE_{LANGUAGE_NAME}__)
...
#endif
```

The default wake word for each language can be found next to the `// wake-word` comment, and the default context is located beside the `// context` comment.

When the demo begins, the context information will be displayed on the console.

## Create Custom Models

1. Copy the UUID of the board printed at the beginning of the session to the IDE console.
1. Go to [Picovoice Console](https://console.picovoice.ai/) to create models for [Porcupine wake word engine](https://picovoice.ai/docs/quick-start/console-porcupine/) and [Rhino Speech-to-Intent engine](https://picovoice.ai/docs/quick-start/console-rhino/).
1. Select `Arm Cortex-M` as the platform when training the model.
1. Select `IMXRT` as the board type and provide the UUID of the chipset on the board.

The model is now being trained. You will be able to download it within a few hours.

## Import the Custom Models

1. Download your custom voice model(s) from [Picovoice Console](https://console.picovoice.ai/).
2. Decompress the zip file. The model file is either `.ppn` for Porcupine wake word or `.rhn` for Rhino Speech-to-Intent. Both zip archives also contain a `.h` header file containing the `C` array version of the binary model.
3. Copy the contents of the arrays inside the `.h` header files and update the `keyword_array` and `context_array` values in [imxrt1050-evkb/inc/pv_params.h](./imxrt1050-evkb/inc/pv_params.h) in the language section for which the model is trained.
