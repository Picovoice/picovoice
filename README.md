# Picovoice

[![GitHub release](https://img.shields.io/github/release/Picovoice/picovoice.svg)](https://github.com/Picovoice/picovoice/releases)
[![GitHub](https://img.shields.io/github/license/Picovoice/picovoice)](https://github.com/Picovoice/picovoice/)
[![GitHub language count](https://img.shields.io/github/languages/count/Picovoice/picovoice)](https://github.com/Picovoice/picovoice/)

[![PyPI](https://img.shields.io/pypi/v/picovoice)](https://pypi.org/project/picovoice/)
[![Nuget](https://img.shields.io/nuget/v/picovoice)](https://www.nuget.org/packages/Picovoice/)
[![Go Reference](https://pkg.go.dev/badge/github.com/Picovoice/picovoice/sdk/go/v2.svg)](https://pkg.go.dev/github.com/Picovoice/picovoice/sdk/go/v2)
[![Pub Version](https://img.shields.io/pub/v/picovoice_flutter)](https://pub.dev/packages/picovoice_flutter)
[![npm](https://img.shields.io/npm/v/@picovoice/picovoice-react-native?label=npm%20%5Breact-native%5D)](https://www.npmjs.com/package/@picovoice/picovoice-react-native)
[![Maven Central](https://img.shields.io/maven-central/v/ai.picovoice/picovoice-android?label=maven%20central%20%5Bandroid%5D)](https://repo1.maven.org/maven2/ai/picovoice/picovoice-android/)
[![Maven Central](https://img.shields.io/maven-central/v/ai.picovoice/picovoice-java?label=maven%20central%20%5Bjava%5D)](https://repo1.maven.org/maven2/ai/picovoice/picovoice-java/)
[![npm](https://img.shields.io/npm/v/@picovoice/picovoice-angular?label=npm%20%5Bangular%5D)](https://www.npmjs.com/package/@picovoice/picovoice-angular)
[![npm](https://img.shields.io/npm/v/@picovoice/picovoice-react?label=npm%20%5Breact%5D)](https://www.npmjs.com/package/@picovoice/picovoice-react)
[![npm](https://img.shields.io/npm/v/@picovoice/picovoice-vue?label=npm%20%5Bvue%5D)](https://www.npmjs.com/package/@picovoice/picovoice-vue)
[![npm](https://img.shields.io/npm/v/@picovoice/picovoice-node?label=npm%20%5Bnode%5D)](https://www.npmjs.com/package/@picovoice/picovoice-node)
<!-- markdown-link-check-disable -->
[![Crates.io](https://img.shields.io/crates/v/picovoice)](https://crates.io/crates/picovoice)
<!-- markdown-link-check-enable -->

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

<!-- markdown-link-check-disable -->
[![Twitter URL](https://img.shields.io/twitter/url?label=%40AiPicovoice&style=social&url=https%3A%2F%2Ftwitter.com%2FAiPicovoice)](https://twitter.com/AiPicovoice)
<!-- markdown-link-check-enable -->
[![YouTube Channel Views](https://img.shields.io/youtube/channel/views/UCAdi9sTCXLosG1XeqDwLx7w?label=YouTube&style=social)](https://www.youtube.com/channel/UCAdi9sTCXLosG1XeqDwLx7w)

Picovoice is the end-to-end platform for building voice products on your terms. Unlike Alexa and Google services,
Picovoice runs entirely on-device while being more accurate. Using Picovoice, one can infer a user’s intent from a
naturally spoken utterance such as:

> "Hey Edison, set the lights in the living room to blue"

Picovoice detects the occurrence of the custom wake word (`Hey Edison`), and then extracts the intent from the follow-on
spoken command:

```json
{
  "intent": "changeColor",
  "slots": {
    "location": "living room",
    "color": "blue"
  }
}
```

## Why Picovoice

- **Private & Secure:** Everything is processed offline. Intrinsically private; HIPAA and GDPR-compliant.
- **Accurate:** Resilient to noise and reverberation. Outperforms cloud-based alternatives by wide margins.
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.
  - Arm Cortex-M, STM32, Arduino, and i.MX RT
  - Raspberry Pi, NVIDIA Jetson Nano, and BeagleBone
  - Android and iOS
  - Chrome, Safari, Firefox, and Edge
  - Linux (x86_64), macOS (x86_64, arm64), and Windows (x86_64)
- **Self-Service:** Design, train, and test voice interfaces instantly in your browser, using [Picovoice Console](https://console.picovoice.ai/).
- **Reliable:** Runs locally without needing continuous connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.

## Build with Picovoice

1. **Evaluate:** The Picovoice SDK is a cross-platform library for adding voice to anything. It includes some
   pre-trained speech models. The SDK is licensed under Apache 2.0 and available on GitHub to encourage independent
   benchmarking and integration testing. You are empowered to make a data-driven decision.

2. **Design:** [Picovoice Console](https://console.picovoice.ai/) is a cloud-based platform for designing voice
   interfaces and training speech models, all within your web browser. No machine learning skills are required. Simply
   describe what you need with text and export trained models.

3. **Develop:** Exported models can run on Picovoice SDK without requiring constant connectivity. The SDK runs on a wide
   range of platforms and supports a large number of frameworks. The Picovoice Console and Picovoice SDK enable you to
   design, build and iterate fast.

4. **Deploy:** Deploy at scale without having to maintain complex cloud infrastructure. Avoid unbounded cloud fees,
   limitations, and control imposed by big tech.

[![Picovoice in Action](https://img.youtube.com/vi/X12N2Rn-q5o/0.jpg)](https://www.youtube.com/watch?v=X12N2Rn-q5o)

## Platform Features

### Custom Wake Words

Picovoice makes use of the [Porcupine wake word engine](https://github.com/Picovoice/porcupine) to detect utterances of
given wake phrases. You can train custom wake words using Picovoice Console and then run the exported wake word model on
the Picovoice SDK.

### Intent Inference

Picovoice relies on the [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) to directly infer user's
intent from spoken commands within a given domain of interest (a "context"). You can design and train custom contexts
for your product using Picovoice Console. The exported Rhino models then can run with the Picovoice SDK on any supported
platform.

## Table of Contents

- [Picovoice](#picovoice)
  - [Why Picovoice?](#why-picovoice)
  - [Build with Picovoice](#build-with-picovoice)
  - [Platform Features](#platform-features)
  - [Table of Contents](#table-of-contents)
  - [Language Support](#language-support)
  - [Performance](#performance)
  - [Picovoice Console](#picovoice-console)
  - [Demos](#demos)
    - [Python](#python-demos)
    - [NodeJS](#nodejs-demos)
    - [.NET](#net-demos)
    - [Java](#java-demos)
    - [Go](#go-demos)
    - [Unity](#unity-demos)
    - [Flutter](#flutter-demos)
    - [React Native](#react-native-demos)
    - [Android](#android-demos)
    - [iOS](#ios-demos)
    - [Web](#web-demos)
      - [Vanilla JavaScript and HTML](#vanilla-javascript-and-html)
      - [Angular](#angular-demos)
      - [React](#react-demos)
      - [Vue](#vue-demos)
    - [Rust](#rust-demos)
    - [C](#c-demos)
    - [Microcontroller](#microcontroller-demos)
  - [SDKs](#sdks)
    - [Python](#python)
    - [NodeJS](#nodejs)
    - [.NET](#net)
    - [Java](#java)
    - [Go](#go)
    - [Unity](#unity)
    - [Flutter](#flutter)
    - [React Native](#react-native)
    - [Android](#android)
    - [iOS](#ios)
    - [Web](#web)
      - [Angular](#angular)
      - [React](#react)
      - [Vue](#vue)
    - [Rust](#rust)
    - [C](#c)
    - [Microcontroller](#microcontroller)
  - [Releases](#releases)
  - [FAQ](#faq)

## Language Support

- English, German, French, Spanish, Italian, Japanese, Korean, and Portuguese.
- Support for additional languages is available for commercial customers on a case-by-case basis.

## Performance

Picovoice makes use of the [Porcupine wake word engine](https://github.com/Picovoice/porcupine) to detect utterances of
given wake phrases. An open-source benchmark of Porcupine is available
[here](https://github.com/Picovoice/wakeword-benchmark). In summary, compared to the best-performing alternative,
Porcupine's standard model is **5.4 times more accurate**.

![](resources/.doc/porcupine-benchmark.png)

Picovoice relies on the [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) to directly infer user's
intent from spoken commands within a given domain of interest (a "context"). An open-source benchmark of Rhino is
available [here](https://github.com/Picovoice/speech-to-intent-benchmark). Rhino outperforms all major cloud-based
alternatives with wide margins.

![](resources/.doc/rhino-benchmark.png)

## Picovoice Console

[Picovoice Console](https://console.picovoice.ai/) is a web-based platform for designing, testing, and training voice
user interfaces. Using Picovoice Console you can train custom wake word, and domain-specific NLU (Speech-to-Intent)
models.

## Demos

If using SSH, clone the repository with:

```console
git clone --recurse-submodules git@github.com:Picovoice/picovoice.git
```

If using HTTPS, clone the repository with:

```console
git clone --recurse-submodules https://github.com/Picovoice/picovoice.git
```

### Python Demos

```console
sudo pip3 install picovoicedemo
```

From the root of the repository run the following in the terminal:

```console
picovoice_demo_mic \
--access_key ${ACCESS_KEY} \
--keyword_path resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
--context_path resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `raspberry-pi`, `beaglebone`, `linux`, `mac`,
or `windows`). The microphone demo opens an audio stream from the microphone, detects utterances of a given wake
phrase, and infers intent from the follow-on spoken command. Once the demo initializes, it prints `[Listening ...]`
to the console. Then say:

> Porcupine, set the lights in the kitchen to purple.

Upon success, the demo prints the following into the terminal:

```text
[wake word]

{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'purple'
  }
}
```

For more information regarding Python demos refer to their [documentation](demo/python/README.md).

### NodeJS Demos

Install the demo package:

```console
npm install -g @picovoice/picovoice-node-demo
```

From the root of the repository run:

```console
pv-mic-demo \
--access_key ${ACCESS_KEY} \
-k resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
-c resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `raspberry-pi`, `linux`, or `mac`). The
microphone demo opens an audio stream from the microphone, detects utterances of a given wake
phrase, and infers intent from the follow-on spoken command. Once the demo initializes, it prints
`Listening for wake word 'porcupine' ...` to the console. Then say:

> Porcupine, turn on the lights.

Upon success, the demo prints the following into the terminal:

```text
Inference:
{
    "isUnderstood": true,
    "intent": "changeLightState",
    "slots": {
        "state": "on"
    }
}
```

Please see the [demo instructions](demo/nodejs/README.md) for details.

### .NET Demos

From the root of the repository run the following in the terminal:

```console
dotnet run -p demo/dotnet/PicovoiceDemo/PicovoiceDemo.csproj -c MicDemo.Release -- \
--access_key ${ACCESS_KEY} \
--keyword_path resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
--context_path resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `linux`, `mac`, or `windows`). The microphone
demo opens an audio stream from the microphone, detects utterances of a given wake phrase, and infers intent from the
follow-on spoken command. Once the demo initializes, it prints `Listening...` to the console. Then say:

> Porcupine, set the lights in the kitchen to orange.

Upon success the following it printed into the terminal:

```text
[wake word]
{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'orange'
  }
}
```

For more information about .NET demos go to [demo/dotnet](demo/dotnet/README.md).

### Java Demos

Make sure there is a working microphone connected to your device. Then invoke the following commands from the terminal:

```console
cd demo/java
./gradlew build
cd build/libs
java -jar picovoice-mic-demo.jar \
-a ${ACCESS_KEY} \
-k resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn \
-c resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `linux`, `mac`, or `windows`). The microphone
demo opens an audio stream from the microphone, detects utterances of a given wake phrase, and infers intent from the
follow-on spoken command. Once the demo initializes, it prints `Listening ...` to the console. Then say:

> Porcupine, set the lights in the kitchen to orange.

Upon success the following it printed into the terminal:

```text
[wake word]
{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'orange'
  }
}
```

For more information about the Java demos go to [demo/java](demo/java/README.md).

### Go Demos

The demos require `cgo`, which means that a gcc compiler like [Mingw](https://www.mingw-w64.org/) is required.

From [demo/go](demo/go) run the following command from the terminal to build and run the mic demo:
```console
go run micdemo/picovoice_mic_demo.go \
-access_key ${ACCESS_KEY} \
-keyword_path "../../resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn" \
-context_path "../../resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn"
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `linux`, `mac`, or `windows`). The microphone
demo opens an audio stream from the microphone, detects utterances of a given wake phrase, and infers intent from the
follow-on spoken command. Once the demo initializes, it prints `Listening ...` to the console. Then say:

> Porcupine, set the lights in the kitchen to orange.

Upon success the following it printed into the terminal:

```text
[wake word]
{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'orange'
  }
}
```

For more information about the Go demos go to [demo/go](demo/go/README.md).

### Unity Demos

To run the Picovoice Unity demo, import the latest [Picovoice Unity package](sdk/unity) into your project, open the PicovoiceDemo scene and hit play. To run on other platforms or in the player, go to _File > Build Settings_, choose your platform and hit the `Build and Run` button.

To browse the demo source go to [demo/unity](demo/unity).

### Flutter Demos

To run the Picovoice demo on Android or iOS with Flutter, you must have the [Flutter SDK](https://flutter.dev/docs/get-started/install) installed on your system. Once installed, you can run `flutter doctor` to determine any other missing requirements for your relevant platform. Once your environment has been set up, launch a simulator or connect an Android/iOS device.

Run the `prepare_demo` script from [demo/flutter](./demo/flutter/) with a language code to set up the demo in the language of your
choice (e.g. `de` -> German, `ko` -> Korean). To see a list of available languages, run `prepare_demo` without a language code.

```console
dart scripts/prepare_demo.dart ${LANGUAGE}
```

Replace your `AccessKey` in [lib/main.dart](./demo/flutter/lib/main.dart) file:

```dart
final String accessKey = "{YOUR_ACCESS_KEY_HERE}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
```

Run the following command from [demo/flutter](./demo/flutter/) to build and deploy the demo to your device:
```console
flutter run
```

Once the demo app has started, press the start button and utter a command to start inferring context. To see more details about the current context information, press the `Context Info` button on the top right corner in the app.

### React Native Demos
To run the React Native Picovoice demo app you'll first need to install yarn and set up your React Native environment. For this, please refer to [React Native's documentation](https://reactnative.dev/docs/environment-setup). Once your environment has been set up, you can run the following commands:

#### Running On Android
```console
cd demo/react-native
yarn android-install    # sets up environment
yarn android-run        # builds and deploys to Android
```

#### Running On iOS

```console
cd demo/react-native
yarn ios-install        # sets up environment
yarn ios-run            # builds and deploys to iOS
```

Once the application has been deployed, press the start button and say

> Porcupine, turn off the lights in the kitchen.

For the full set of supported commands refer to [demo's readme](demo/react-native/README.md).

### Android Demos

Using Android Studio, open [demo/android/Activity](demo/android/Activity) as an Android project and then run the
application. Press the start button and say

> Porcupine, turn off the lights in the kitchen.

For the full set of supported commands refer to [demo's readme](demo/android/README.md).

### iOS Demos

The BackgroundService demo runs audio recording in the background while the application is **not** in focus and remains running in the background.
The ForegroundApp demo runs **only** when the application is in focus.

#### BackgroundService Demo

To run the demo, go to [demo/ios/BackgroundService](demo/ios/BackgroundService) and run:

```console
pod install
```

Then, using [Xcode](https://developer.apple.com/xcode/), open the generated `PicovoiceBackgroundServiceDemo.xcworkspace` and paste your `AccessKey` into the `ACCESS_KEY` variable in `ContentView.swift`. Build and run the demo.

#### ForegroundApp Demo

To run the demo, go to [demo/ios/ForegroundApp](demo/ios/ForegroundApp) and run:

```console
pod install
```

Then, using [Xcode](https://developer.apple.com/xcode/), open the generated `PicovoiceForegroundAppDemo.xcworkspace` and paste your `AccessKey` into the `ACCESS_KEY` variable in `ContentView.swift`. Build and run the demo.

#### Wake Word Detection and Context Inference

After running the demo, press the start button and try saying the following:

> Picovoice, shut of the lights in the living room.

For more details about the iOS demos and full set of supported commands refer to [demo's readme](demo/ios/README.md).

### Web Demos

#### Vanilla JavaScript and HTML

From [demo/web](demo/web) use `yarn` or `npm` to install the dependencies, and the `start` script with a language code
to start a local web server hosting the demo in the language of your choice (e.g. `pl` -> Polish, `ko` -> Korean).
To see a list of available languages, run `start` without a language code.

```console
yarn
yarn start ${LANGUAGE}
```

(or)

```console
npm install
npm run start ${LANGUAGE}
```

Open `http://localhost:5000` in your browser to try the demo.

#### Angular Demos

From [demo/angular](demo/angular) use `yarn` or `npm` to install the dependencies, and the `start` script with a language code
to start a local web server hosting the demo in the language of your choice (e.g. `pl` -> Polish, `ko` -> Korean).
To see a list of available languages, run `start` without a language code.

```console
yarn
yarn start ${LANGUAGE}
```

(or)

```console
npm install
npm run start ${LANGUAGE}
```

Open `http://localhost:4200` in your browser to try the demo.

#### React Demos

From [demo/react](demo/react) use `yarn` or `npm` to install the dependencies, and the `start` script with a language code
to start a local web server hosting the demo in the language of your choice (e.g. `pl` -> Polish, `ko` -> Korean).
To see a list of available languages, run `start` without a language code.

```console
yarn
yarn start ${LANGUAGE}
```

(or)

```console
npm install
npm run start ${LANGUAGE}
```

Open `http://localhost:3000` in your browser to try the demo.

#### Vue Demos

From [demo/vue](demo/vue) use `yarn` or `npm` to install the dependencies, and the `start` script with a language code
to start a local web server hosting the demo in the language of your choice (e.g. `pl` -> Polish, `ko` -> Korean).
To see a list of available languages, run `start` without a language code.

```console
yarn
yarn start ${LANGUAGE}
```

(or)

```console
npm install
npm run start ${LANGUAGE}
```

The command-line output will provide you with a localhost link and port to open in your browser.

### Rust Demos

From [demo/rust/micdemo](demo/rust/micdemo) run the following command from the terminal to build and run the mic demo:
```console
cargo run --release -- \
--keyword_path "../../../resources/porcupine/resources/keyword_files/${PLATFORM}/porcupine_${PLATFORM}.ppn" \
--context_path "../../../resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn"
```

Replace `${PLATFORM}` with the platform you are running the demo on (e.g. `linux`, `mac`, or `windows`).
The microphone demo opens an audio stream from the microphone, detects utterances of a given wake phrase, and infers intent from the follow-on spoken command.
Once the demo initializes, it prints `Listening ...` to the console.
Then say:

> Porcupine, set the lights in the kitchen to orange.

Upon success the following it printed into the terminal:

```text
[wake word]
{
  intent : 'changeColor'
  slots : {
    location : 'kitchen'
    color : 'orange'
  }
}
```

For more information about the Rust demos go to [demo/rust](demo/rust/README.md).

### C Demos

The C demo requires [CMake](https://cmake.org/) version 3.4 or higher.

The [Microphone demo](demo/c/picovoice_demo_mic.c) requires [miniaudio](https://github.com/mackron/miniaudio) for accessing microphone audio data.

**Windows Requires [MinGW](https://www.mingw-w64.org/) to build the demo.**

#### Microphone Demo

At the root of the repository, build with:

```console
cmake -S demo/c/. -B demo/c/build && cmake --build demo/c/build --target picovoice_demo_mic
```

#### Linux (x86_64), macOS (x86_64), Raspberry Pi, and BeagleBone

List input audio devices with:

```console
./demo/c/build/picovoice_demo_mic --show_audio_devices
```

Run the demo using:

```console
./demo/c/build/picovoice_demo_mic \
-a ${ACCESS_KEY}
-l ${PICOVOICE_LIBRARY_PATH} \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/${PLATFORM}/picovoice_${PLATFORM}.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/${PLATFORM}/smart_lighting_${PLATFORM}.rhn \
-i {AUDIO_DEVICE_INDEX}
```

Replace `${LIBRARY_PATH}` with path to appropriate library available under [/sdk/c/lib](sdk/c/lib), `${PLATFORM}` with the
name of the platform you are running on (`linux`, `raspberry-pi`, `mac`, or `beaglebone`), and `${AUDIO_DEVICE_INDEX}` with
the index of your audio device.

#### Windows

List input audio devices with:

```console
.\\demo\\c\\build\\picovoice_demo_mic.exe --show_audio_devices
```

Run the demo using:

```console
.\\demo\\c\\build\\picovoice_demo_mic.exe -a ${ACCESS_KEY} -l sdk/c/lib/windows/amd64/libpicovoice.dll -p resources/porcupine/lib/common/porcupine_params.pv -k resources/porcupine/resources/keyword_files/windows/picovoice_windows.ppn -r resources/rhino/lib/common/rhino_params.pv -c resources/rhino/resources/contexts/windows/smart_lighting_windows.rhn -i {AUDIO_DEVICE_INDEX}
```

Replace `${AUDIO_DEVICE_INDEX}` with the index of your audio device.

The demo opens an audio stream and waits for the wake word "Picovoice" to be detected. Once it is detected, it infers
your intent from spoken commands in the context of a smart lighting system. For example, you can say:

> "Turn on the lights in the bedroom."

#### File Demo

At the root of the repository, build with:

```console
cmake -S demo/c/. -B demo/c/build && cmake --build demo/c/build --target picovoice_demo_file
```

#### Linux (x86_64), macOS (x86_64), Raspberry Pi, and BeagleBone

Run the demo using:

```console
./demo/c/build/picovoice_demo_file \
-a ${ACCESS_KEY}
-l ${LIBRARY_PATH} \
-p resources/porcupine/lib/common/porcupine_params.pv \
-k resources/porcupine/resources/keyword_files/${PLATFORM}/picovoice_${PLATFORM}.ppn \
-r resources/rhino/lib/common/rhino_params.pv \
-c resources/rhino/resources/contexts/${PLATFORM}/coffee_maker_${PLATFORM}.rhn \
-w resources/audio_samples/picovoice-coffee.wav
```

Replace `${LIBRARY_PATH}` with path to appropriate library available under [sdk/c/lib](sdk/c/lib), `${PLATFORM}` with the
name of the platform you are running on (`linux`, `raspberry-pi`, `mac`, or `beaglebone`).

#### Windows

Run the demo using:

```console
.\\demo\\c\\build\\picovoice_demo_file.exe -a ${ACCESS_KEY} -l sdk/c/lib/windows/amd64/libpicovoice.dll -p resources/porcupine/lib/common/porcupine_params.pv -k resources/porcupine/resources/keyword_files/windows/picovoice_windows.ppn -r resources/rhino/lib/common/rhino_params.pv -c resources/rhino/resources/contexts/windows/coffee_maker_windows.rhn -w resources/audio_samples/picovoice-coffee.wav
```

The demo opens up the WAV file. It detects the wake word and infers the intent in the context of a coffee maker system.

For more information about C demos go to [demo/c](demo/c).

### Microcontroller Demos

There are several projects for various development boards inside the [mcu demo](demo/mcu) folder.

## SDKs

### Python

Install the package:

```console
pip3 install picovoice
```

Create a new instance of Picovoice:

```python
from picovoice import Picovoice

access_key = "${ACCESS_KEY}" # AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

keyword_path = ...

def wake_word_callback():
    pass

context_path = ...

def inference_callback(inference):
    print(inference.is_understood)
    print(inference.intent)
    print(inference.slots)

handle = Picovoice(
        access_key=access_key,
        keyword_path=keyword_path,
        wake_word_callback=wake_word_callback,
        context_path=context_path,
        inference_callback=inference_callback)
```

`handle` is an instance of the Picovoice runtime engine. It detects utterances of wake phrase defined in the file located at
`keyword_path`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `context_path`. `keyword_path` is the absolute path to the
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` extension).
`context_path` is the absolute path to the [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` extension). `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is
invoked upon completion of follow-on voice command inference.

When instantiated, the required rate can be obtained via `handle.sample_rate`. Expected number of audio samples per
frame is `handle.frame_length`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio. The
set of supported commands can be retrieved (in YAML format) via `handle.context_info`.

```python
def get_next_audio_frame():
    pass

while True:
    handle.process(get_next_audio_frame())
```

When done, resources have to be released explicitly `handle.delete()`.

### NodeJS

The Picovoice SDK for NodeJS is available from NPM:

```console
yarn add @picovoice/picovoice-node
```

(or)

```console
npm install @picovoice/picovoice-node
```

The SDK provides the `Picovoice` class. Create an instance of this class using a Porcupine keyword (with `.ppn` extension)
and Rhino context file (with `.rhn` extension), as well as callback functions that will be invoked on wake word detection
and command inference completion events, respectively:

```javascript
const Picovoice = require("@picovoice/picovoice-node");

const accessKey = "${ACCESS_KEY}"; // Obtained from the Picovoice Console (https://console.picovoice.ai/)

let keywordCallback = function (keyword) {
  console.log(`Wake word detected`);
};

let inferenceCallback = function (inference) {
  console.log("Inference:");
  console.log(JSON.stringify(inference, null, 4));
};

let handle = new Picovoice(
  accessKey,
  keywordArgument,
  keywordCallback,
  contextPath,
  inferenceCallback
);
```

The `keywordArgument` can either be a path to a Porcupine keyword file (.ppn), or one of the built-in keywords
(integer enums). The `contextPath` is the path to the Rhino context file (.rhn).

Upon constructing the Picovoice class, send it frames of audio via its `process` method. Internally, Picovoice will
switch between wake word detection and inference. The Picovoice class includes `frameLength` and `sampleRate` properties
for the format of audio required.

```javascript
// process audio frames that match the Picovoice requirements (16-bit linear pcm audio, single-channel)
while (true) {
  handle.process(frame);
}
```

As the audio is processed through the Picovoice engines, the callbacks will fire.

### .NET

You can install the latest version of Picovoice by adding the latest
[Picovoice NuGet package](https://www.nuget.org/packages/Picovoice/) in Visual Studio or using the .NET CLI.

```console
dotnet add package Picovoice
```

To create an instance of Picovoice, do the following:

```csharp
using Pv;

const string accessKey = "${ACCESS_KEY}"; // obtained from Picovoice Console (https://console.picovoice.ai/)

string keywordPath = "/absolute/path/to/keyword.ppn";
void wakeWordCallback() => {..}
string contextPath = "/absolute/path/to/context.rhn";
void inferenceCallback(Inference inference)
{
    // `inference` exposes three immutable properties:
    // (1) `IsUnderstood`
    // (2) `Intent`
    // (3) `Slots`
    // ..
}

Picovoice handle = Picovoice.Create(accessKey,
                                 keywordPath,
                                 wakeWordCallback,
                                 contextPath,
                                 inferenceCallback);
```

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in the file located at
`keywordPath`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `contextPath`. `accessKey` is your Picovoice `AccessKey`. `keywordPath` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` extension).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` extension). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, the required sample rate can be obtained via `handle.SampleRate`. The expected number of audio samples per
frame is `handle.FrameLength`. The Picovoice engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```csharp
short[] GetNextAudioFrame()
{
    // .. get audioFrame
    return audioFrame;
}

while(true)
{
    handle.Process(GetNextAudioFrame());
}
```

Picovoice will have its resources freed by the garbage collector, but to have resources freed immediately after use, wrap it in a `using` statement:

```csharp
using(Picovoice handle = Picovoice.Create(accessKey, keywordPath, wakeWordCallback, contextPath, inferenceCallback))
{
    // .. Picovoice usage here
}
```

### Java

The Picovoice Java library is available from Maven Central at `ai.picovoice:picovoice-java:${version}`.

The easiest way to create an instance of the engine is with the Picovoice Builder:

```java
import ai.picovoice.picovoice.*;

String keywordPath = "/absolute/path/to/keyword.ppn";

final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from [Picovoice Console](https://console.picovoice.ai/)

PicovoiceWakeWordCallback wakeWordCallback = () -> {..};

String contextPath = "/absolute/path/to/context.rhn";

PicovoiceInferenceCallback inferenceCallback = inference -> {
    // `inference` exposes three getters:
    // (1) `getIsUnderstood()`
    // (2) `getIntent()`
    // (3) `getSlots()`
    // ..
};

try {
    Picovoice handle = new Picovoice.Builder()
                    .setAccessKey(accessKey)
                    .setKeywordPath(keywordPath)
                    .setWakeWordCallback(wakeWordCallback)
                    .setContextPath(contextPath)
                    .setInferenceCallback(inferenceCallback)
                    .build();
} catch (PicovoiceException e) { }
```

`handle` is an instance of the Picovoice runtime engine that detects utterances of wake phrase defined in the file located at
`keywordPath`. Upon detection of wake word it starts inferring the user's intent from the follow-on voice command within
the context defined by the file located at `contextPath`. `keywordPath` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` extension).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` extension). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, the required sample rate can be obtained via `handle.getSampleRate()`. The expected number of audio samples per
frame is `handle.getFrameLength()`. The Picovoice engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```java
short[] getNextAudioFrame()
{
    // .. get audioFrame
    return audioFrame;
}

while(true)
{
    handle.process(getNextAudioFrame());
}
```

Once you're done with Picovoice, ensure you release its resources explicitly:

```java
handle.delete();
```

### Go

To install the Picovoice Go module to your project, use the command:
```console
go get github.com/Picovoice/picovoice/sdk/go
```

To create an instance of the engine with default parameters, use the `NewPicovoice` function. You must provide a Porcupine keyword file, a wake word detection callback function, a Rhino context file and an inference callback function. You must then make a call to `Init()`.

```go
. "github.com/Picovoice/picovoice/sdk/go/v2"
rhn "github.com/Picovoice/rhino/binding/go/v2"

const accessKey string = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

keywordPath := "/path/to/keyword/file.ppn"
wakeWordCallback := func() {
    // let user know wake word detected
}

contextPath := "/path/to/keyword/file.rhn"
inferenceCallback := func(inference rhn.RhinoInference) {
    if inference.IsUnderstood {
            intent := inference.Intent
            slots := inference.Slots
        // add code to take action based on inferred intent and slot values
    } else {
        // add code to handle unsupported commands
    }
}

picovoice := NewPicovoice(
    accessKey,
    keywordPath,
    wakeWordCallback,
    contextPath,
    inferenceCallback)

err := picovoice.Init()
if err != nil {
    // handle error
}
```

Upon detection of wake word defined by `keywordPath` it starts inferring user's intent from the follow-on voice command within
the context defined by the file located at `contextPath`. `accessKey` is your Picovoice `AccessKey`. `keywordPath` is the absolute path to
[Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`contextPath` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file
(with `.rhn` suffix). `wakeWordCallback` is invoked upon the detection of wake phrase and `inferenceCallback` is
invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `SampleRate`. Expected number of audio samples per
frame is `FrameLength`. The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio.

```go
func getNextFrameAudio() []int16 {
    // get audio frame
}

for {
    err := picovoice.Process(getNextFrameAudio())
}
```

When done resources have to be released explicitly

```go
picovoice.Delete()
```

### Unity

Import the latest [Picovoice Unity Package](sdk/unity) into your Unity project.

The SDK provides two APIs:

#### High-Level API

[PicovoiceManager](sdk/unity/Assets/Picovoice/PicovoiceManager.cs) provides a high-level API that takes care of audio recording. This is the quickest way to get started.

The constructor `PicovoiceManager.Create` will create an instance of the PicovoiceManager using the Porcupine keyword and Rhino context files that you pass to it.
```csharp
using Pv.Unity;

PicovoiceManager _picovoiceManager = new PicovoiceManager(
                                "/path/to/keyword/file.ppn",
                                () => {},
                                "/path/to/context/file.rhn",
                                (inference) => {};
```

Once you have instantiated a PicovoiceManager, you can start/stop audio capture and processing by calling:
```csharp
try
{
    _picovoiceManager.Start();
}
catch(Exception ex)
{
    Debug.LogError(ex.ToString());
}

// .. use picovoice

_picovoiceManager.Stop();
```

PicovoiceManager uses our
[unity-voice-processor](https://github.com/Picovoice/unity-voice-processor/)
Unity package to capture frames of audio and automatically pass it to the Picovoice platform.

#### Low-Level API

[Picovoice](sdk/unity/Assets/Picovoice/Picovoice.cs) provides low-level access to the Picovoice platform for those
who want to incorporate it into an already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file and Rhino context file to the `Create` static constructor.

```csharp
using Pv.Unity;

try
{
    Picovoice _picovoice = Picovoice.Create(
                                "path/to/keyword/file.ppn",
                                OnWakeWordDetected,
                                "path/to/context/file.rhn",
                                OnInferenceResult);
}
catch (Exception ex)
{
    // handle Picovoice init error
}
```

To use Picovoice, you must pass frames of audio to the `Process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```csharp
short[] GetNextAudioFrame()
{
    // .. get audioFrame
    return audioFrame;
}

short[] buffer = GetNextAudioFrame();
try
{
    _picovoice.Process(buffer);
}
catch (Exception ex)
{
    Debug.LogError(ex.ToString());
}
```

For `Process` to work correctly, the provided audio must be single-channel and 16-bit linearly-encoded.

Picovoice implements the `IDisposable` interface, so you can use Picovoice in a `using` block. If you don't use a `using` block, resources will be released by the garbage collector automatically, or you can explicitly release the resources like so:

```csharp
_picovoice.Dispose();
```

### Flutter

Add the [Picovoice Flutter package](https://pub.dev/packages/picovoice) to your pub.yaml.
```yaml
dependencies:
  picovoice: ^<version>
```
The SDK provides two APIs:

#### High-Level API

[PicovoiceManager](sdk/flutter/lib/picovoice_manager.dart) provides a high-level API that takes care of
audio recording. This class is the quickest way to get started.

The static constructor `PicovoiceManager.create` will create an instance of a PicovoiceManager using a Porcupine keyword file and Rhino context file that you pass to it.
```dart
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';

final String accessKey = "{ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

void createPicovoiceManager() {
  _picovoiceManager = PicovoiceManager.create(
      accessKey,
      "/path/to/keyword/file.ppn",
      _wakeWordCallback,
      "/path/to/context/file.rhn",
      _inferenceCallback);
}
```

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

The `inferenceCallback` callback function takes a parameter of `RhinoInference` instance with the following variables:
- isUnderstood - true if Rhino understood what it heard based on the context or false if Rhino did not understand context
- intent - **null** if `isUnderstood` is not true, otherwise name of intent that were inferred
- slots - **null** if `isUnderstood` is not true, otherwise the dictionary of slot keys and values that were inferred

Once you have instantiated a PicovoiceManager, you can start/stop audio capture and processing by calling:

```dart
await _picovoiceManager.start();
// .. use for detecting wake words and commands
await _picovoiceManager.stop();
```

Our [flutter_voice_processor](https://github.com/Picovoice/flutter-voice-processor/)
Flutter plugin handles audio capture and passes frames to Picovoice for you.

#### Low-Level API

[Picovoice](sdk/flutter/lib/picovoice.dart) provides low-level access to the Picovoice platform for those
who want to incorporate it into an already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file and Rhino context file to the `create` static constructor. Sensitivity, model files and requireEndpoint are optional.

```dart
import 'package:picovoice/picovoice_manager.dart';
import 'package:picovoice/picovoice_error.dart';

final String accessKey = "{ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

void createPicovoice() async {
    double porcupineSensitivity = 0.7;
    double rhinoSensitivity = 0.6;
    try {
        _picovoice = await Picovoice.create(
            accessKey,
            "/path/to/keyword/file.ppn",
            wakeWordCallback,
            "/path/to/context/file.rhn",
            inferenceCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine/model.pv",
            "/path/to/rhino/model.pv",
            requireEndpoint);
    } on PicovoiceException catch (err) {
        // handle picovoice init error
    }
}
```

To use Picovoice, just pass frames of audio to the `process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```dart
List<int> buffer = getAudioFrame();

try {
    _picovoice.process(buffer);
} on PicovoiceException catch (error) {
    // handle error
}

// once you are done using Picovoice
_picovoice.delete();
```

### React Native

First add our React Native modules to your project via yarn or npm:
```console
yarn add @picovoice/react-native-voice-processor
yarn add @picovoice/porcupine-react-native
yarn add @picovoice/rhino-react-native
yarn add @picovoice/picovoice-react-native
```

The [@picovoice/picovoice-react-native](https://www.npmjs.com/package/@picovoice/picovoice-react-native) package exposes a high-level and a low-level API for integrating Picovoice into your application.

#### High-Level API

[PicovoiceManager](sdk/react-native/src/picovoice_manager.tsx) provides a high-level API that takes care of
audio recording. This class is the quickest way to get started.

The static constructor `PicovoiceManager.create` will create an instance of a PicovoiceManager using a Porcupine keyword file and Rhino context file that you pass to it.
```javascript
const accessKey = "${ACCESS_KEY}"; // obtained from Picovoice Console (https://console.picovoice.ai/)

this._picovoiceManager = PicovoiceManager.create(
    accessKey,
    '/path/to/keyword/file.ppn',
    wakeWordCallback,
    '/path/to/context/file.rhn',
    inferenceCallback);
```

The `wakeWordCallback` and `inferenceCallback` parameters are functions that you want to execute when a wake word is detected and when an inference is made.

Once you have instantiated a PicovoiceManager, you can start/stop audio capture and processing by calling:

```javascript
try {
  let didStart = await this._picovoiceManager.start();
} catch(err) { }
// .. use for detecting wake words and commands
let didStop = await this._picovoiceManager.stop();
```

[@picovoice/react-native-voice-processor](https://github.com/Picovoice/react-native-voice-processor/)
module handles audio capture and passes frames to Picovoice for you.

#### Low-Level API

[Picovoice](sdk/react-native/src/picovoice.tsx) provides low-level access to the Picovoice platform for those
who want to incorporate it into an already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file and Rhino context file to the `create` static constructor. Sensitivity and model files are optional.

```javascript
const accessKey = "${ACCESS_KEY}"; // obtained from Picovoice Console (https://console.picovoice.ai/)

async createPicovoice() {
    let porcupineSensitivity = 0.7;
    let rhinoSensitivity = 0.6;
    let requireEndpoint = false;

    try {
        this._picovoice = await Picovoice.create(
            accessKey,
            '/path/to/keyword/file.ppn',
            wakeWordCallback,
            '/path/to/context/file.rhn',
            inferenceCallback,
            processErrorCallback,
            porcupineSensitivity,
            rhinoSensitivity,
            "/path/to/porcupine/model.pv",
            "/path/to/rhino/model.pv",
            requireEndpoint);
    } catch (err) {
        // handle error
    }
}
```

To use Picovoice, just pass frames of audio to the `process` function. The callbacks will automatically trigger when the wake word is detected and then when the follow-on command is detected.

```javascript
let buffer = getAudioFrame();

try {
    await this._picovoice.process(buffer);
} catch (e) {
    // handle error
}

// once you are done
this._picovoice.delete();
```

### Android

Porcupine can be found on Maven Central. To include the package in your Android project, ensure you have included `mavenCentral()` in your top-level `build.gradle` file and then add the following to your app's `build.gradle`:

```groovy
dependencies {
    // ...
    implementation 'ai.picovoice:picovoice-android:${LATEST_VERSION}'
}
```

There are two possibilities for integrating Picovoice into an Android application.

#### High-Level API

[PicovoiceManager](sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/PicovoiceManager.java) provides
a high-level API for integrating Picovoice into Android applications. It manages all activities related to creating an
input audio stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and
inference completion.

```java
final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
final String keywordPath = "/path/to/keyword.ppn"; // path relative to 'assets' folder
final String contextPath = "/path/to/context.rhn"; // path relative to 'assets' folder

PicovoiceManager manager = new PicovoiceManager.Builder()
    .setAccessKey(accessKey)
    .setKeywordPath(keywordPath)
    .setWakeWordCallback(new PicovoiceWakeWordCallback() {
        @Override
        public void invoke() {
            // logic to execute upon detection of wake word
        }
    })
    .setContextPath(contextPath)
    .setInferenceCallback(new PicovoiceInferenceCallback() {
        @Override
        public void invoke(final RhinoInference inference) {
            // logic to execute upon completion of intent inference
        }
    })
    .build(appContext);
);
```

Keyword (`.ppn`) and context (`.rhn`) files should be placed under the Android project assets folder (`src/main/assets/`).

The `appContext` parameter is the Android application context - this is used to extract Picovoice resources from the APK.

When initialized, input audio can be processed using:

```java
manager.start();
```

Stop the manager with:

```java
manager.stop();
```

#### Low-Level API

[Picovoice.java](sdk/android/Picovoice/picovoice/src/main/java/ai/picovoice/picovoice/Picovoice.java) provides a
low-level binding for Android. It can be initialized as follows:

```java
import ai.picovoice.picovoice.*;

try {
    Picovoice picovoice = new Picovoice.Builder()
        .setPorcupineModelPath("/path/to/porcupine/model.pv")
        .setKeywordPath("/path/to/keyword.ppn")
        .setPorcupineSensitivity(0.7f)
        .setWakeWordCallback(new PicovoiceWakeWordCallback() {
            @Override
            public void invoke() {
                // logic to execute upon detection of wake word
            }
        })
        .setRhinoModelPath("/path/to/rhino/model.pv")
        .setContextPath("/path/to/context.rhn")
        .setRhinoSensitivity(0.55f)
        .setInferenceCallback(new PicovoiceInferenceCallback() {
            @Override
            public void invoke(final RhinoInference inference) {
                // logic to execute upon completion of intent inference
            }
        })
        .build(appContext);
} catch(PicovoiceException ex) { }
```

Keyword (`.ppn`), context (`.rhn`) and model (`.pv`) files should be placed under the Android project assets folder (`src/main/assets/`).

Once initialized, `picovoice` can be used to process incoming audio.

```java
private short[] getNextAudioFrame();

while (true) {
    try {
        picovoice.process(getNextAudioFrame());
    } catch (PicovoiceException e) {
        // error handling logic
    }
}
```

Finally, be sure to explicitly release resources acquired as the binding class does not rely on the garbage collector for releasing native resources:

```java
picovoice.delete();
```

### iOS

The Picovoice iOS SDK is available via [Cocoapods](https://cocoapods.org). To import it into your iOS project install Cocoapods and add the following line to your Podfile:

```ruby
pod 'Picovoice-iOS'
```

There are two possibilities for integrating Picovoice into an iOS application.

#### High-Level API

[PicovoiceManager](sdk/ios/PicovoiceManager.swift) class manages all activities related to creating an audio input
stream, feeding it into Picovoice engine, and invoking user-defined callbacks upon wake word detection and completion of
intent inference. The class can be initialized as below:

```swift
import Picovoice

let accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

let manager = PicovoiceManager(
    accessKey: accessKey,
    keywordPath: "/path/to/keyword.ppn",
    onWakeWordDetection: {
        // logic to execute upon detection of wake word
    },
    contextPath: "/path/to/context.rhn",
    onInference: { inference in
        // logic to execute upon completion of intent inference
    })
```

when initialized input audio can be processed using `manager.start()`. The processing can be interrupted using
`manager.stop()`.

#### Low-Level API

[Picovoice.swift](sdk/ios/Picovoice.swift) provides an API for passing audio from your own audio pipeline into the Picovoice Platform for wake word detection and intent inference.

o construct an instance, you'll need to provide a Porcupine keyword file (.ppn), a Rhino context file (.rhn) and callbacks for when the wake word is detected and an inference is made. Sensitivity and model parameters are optional

```swift
import Picovoice

let accessKey = "${ACCESS_KEY}" // obtained from Picovoice Console (https://console.picovoice.ai/)

do {
    let picovoice = try Picovoice(
        accessKey: accessKey,
        keywordPath: "/path/to/keyword.ppn",
        porcupineSensitivity: 0.4,
        porcupineModelPath: "/path/to/porcupine/model.pv"
        onWakeWordDetection: {
            // logic to execute upon detection of wake word
        },
        contextPath: "/path/to/context.rhn",
        rhinoSensitivity: 0.7,
        rhinoModelPath: "/path/to/rhino/model.pv"
        onInference: { inference in
            // logic to execute upon completion of intent inference
        })
} catch { }
```

Once initialized, `picovoice` can be used to process incoming audio. The underlying logic of the class will handle switching between wake word detection and intent inference, as well as invoking the associated events.

```swift
func getNextAudioFrame() -> [Int16] {
    // .. get audioFrame
    return audioFrame;
}

while (true) {
    do {
        try picovoice.process(getNextAudioFrame());
    } catch { }
}
```

Once you're done with an instance of Picovoice you can force it to release its native resources rather than waiting for the garbage collector:

```swift
picovoice.delete();
```

### Web

Install the Web SDK using yarn:

```console
yarn add @picovoice/picovoice-web
```

or using npm:

```console
npm install --save @picovoice/picovoice-web
```

Create an instance of the engine using `PicovoiceWorker` and run on an audio input stream:

```typescript
import { PicovoiceWorker } from "@picovoice/picovoice-web";

function wakeWordCallback(detection: PorcupineDetection) {
  console.log(`Porcupine detected keyword: ${detection.label}`);
}

function inferenceCallback(inference: RhinoInference) {
  if (inference.isFinalized) {
    if (inference.isUnderstood) {
      console.log(inference.intent)
      console.log(inference.slots)
    }
  }
}

function getAudioData(): Int16Array {
  ... // function to get audio data
  return new Int16Array();
}

const picovoice = await PicovoiceWorker.create(
  "${ACCESS_KEY}",
  keyword,
  wakeWordCallback,
  porcupineModel,
  context,
  inferenceCallback,
  rhinoModel
);

for (; ;) {
  picovoice.process(getAudioData());
  // break on some condition
}
```

Replace `${ACCESS_KEY}` with yours obtained from [Picovoice Console](https://console.picovoice.ai/).

When done, release the resources allocated to Picovoice using `picovoice.release()`.

#### Angular

```console
yarn add @picovoice/picovoice-angular @picovoice/web-voice-processor
```

(or)

```console
npm install @picovoice/picovoice-angular @picovoice/web-voice-processor
```

```typescript
import { Subscription } from "rxjs"
import { PicovoiceService } from "@picovoice/picovoice-angular"

...

constructor(private picovoiceService: PicovoiceService) {
  this.wakeWordDetectionSubscription = picovoiceService.wakeWordDetection$.subscribe(
          (wakeWordDetection: PorcupineDetection) => {
            this.inference = null;
            this.wakeWordDetection = wakeWordDetection;
          }
  );

  this.inferenceSubscription = picovoiceService.inference$.subscribe(
          (inference: RhinoInference) => {
            this.wakeWordDetection = null;
            this.inference = inference;
          }
  );

  this.contextInfoSubscription = picovoiceService.contextInfo$.subscribe(
          (contextInfo: string | null) => {
            this.contextInfo = contextInfo;
          }
  );

  this.isLoadedSubscription = picovoiceService.isLoaded$.subscribe(
          (isLoaded: boolean) => {
            this.isLoaded = isLoaded;
          }
  );
  this.isListeningSubscription = picovoiceService.isListening$.subscribe(
          (isListening: boolean) => {
            this.isListening = isListening;
          }
  );
  this.errorSubscription = picovoiceService.error$.subscribe(
          (error: string | null) => {
            this.error = error;
          }
  );
}

async ngOnInit() {
    try {
      await this.picovoiceService.init(
              accessKey,
              porcupineKeyword,
              porcupineModel,
              rhinoContext,
              rhinoModel
      );
    }
    catch (error) {
      console.error(error)
    }
}

ngOnDestroy() {
  this.wakeWordDetectionSubscription.unsubscribe();
  this.inferenceSubscription.unsubscribe();
  this.contextInfoSubscription.unsubscribe();
  this.isLoadedSubscription.unsubscribe();
  this.isListeningSubscription.unsubscribe();
  this.errorSubscription.unsubscribe();
  this.picovoiceService.release();
}
```

#### React

```console
yarn add @picovoice/picovoice-react @picovoice/web-voice-processor
```

(or)

```console
npm install @picovoice/picovoice-react @picovoice/web-voice-processor
```

```javascript
import { usePicovoice } from '@picovoice/picovoice-react';

function App(props) {
  const {
    wakeWordDetection,
    inference,
    contextInfo,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  } = usePicovoice();

  const initEngine = async () => {
    await init(
            ${ACCESS_KEY},
            porcupineKeyword,
            porcupineModel,
            rhinoContext,
            rhinoModel
    );
    await start();
  }

  useEffect(() => {
    if (wakeWordDetection !== null) {
      console.log(`Picovoice detected keyword: ${wakeWordDetection.label}`);
    }
  }, [wakeWordDetection])

  useEffect(() => {
    if (inference !== null) {
      if (inference.isUnderstood) {
        console.log(inference.intent)
        console.log(inference.slots)
      }
    }
  }, [inference])
}
```

#### Vue

```console
yarn add @picovoice/picovoice-vue @picovoice/web-voice-processor
```

(or)

```console
npm install @picovoice/picovoice-vue @picovoice/web-voice-processor
```

```vue
<script lang='ts'>
import { usePicovoice } from '@picovoice/picovoice-vue';

export default {
  data() {
    const {
      state,
      init,
      start,
      stop,
      release
    } = usePicovoice();

    init(
      ${ACCESS_KEY},
      {
        label: "Picovoice",
        publicPath: "picovoice_wasm.ppn",
      },
      { publicPath: "porcupine_params.pv" },
      { publicPath: "clock_wasm.rhn" },
      { publicPath: "rhino_params.pv" },
    );

    return {
      state,
      start,
      stop,
      release
    }
  },
  watch: {
    "state.wakeWordDetection": function(wakeWord) {
      if (wakeWord !== null) {
        console.log(wakeWord)
      }
    },
    "state.inference": function(inference) {
      if (inference !== null) {
        console.log(inference)
      }
    },
    "state.contextInfo": function(contextInfo) {
      if (contextInfo !== null) {
        console.log(contextInfo)
      }
    },
    "state.isLoaded": function(isLoaded) {
      console.log(isLoaded)
    },
    "state.isListening": function(isListening) {
      console.log(isListening)
    },
    "state.error": function(error) {
      console.error(error)
    },
  },
  onBeforeDestroy() {
    this.release();
  },
};
</script>
```

### Rust

To add the picovoice library into your app, add `picovoice` to your app's `Cargo.toml` manifest:
```toml
[dependencies]
picovoice = "*"
```

To create an instance of the engine with default parameters, use the `PicovoiceBuilder` function.
You must provide a Porcupine keyword file, a wake word detection callback function, a Rhino context file and an inference callback function.
You must then make a call to `init()`:

```rust
use picovoice::{rhino::RhinoInference, PicovoiceBuilder};

let wake_word_callback = || {
    // let user know wake word detected
};
let inference_callback = |inference: RhinoInference| {
    if inference.is_understood {
        let intent = inference.intent.unwrap();
        let slots = inference.slots;
        // add code to take action based on inferred intent and slot values
    } else {
        // add code to handle unsupported commands
    }
};

let mut picovoice = PicovoiceBuilder::new(
    keyword_path,
    wake_word_callback,
    context_path,
    inference_callback,
).init().expect("Failed to create picovoice");
```

Upon detection of wake word defined by `keyword_path` it starts inferring user's intent
from the follow-on voice command within the context defined by the file located at `context_path`.
`keyword_path` is the absolute path to [Porcupine wake word engine](https://github.com/Picovoice/porcupine) keyword file (with `.ppn` suffix).
`context_path` is the absolute path to [Rhino Speech-to-Intent engine](https://github.com/Picovoice/rhino) context file (with `.rhn` suffix).
`wake_word_callback` is invoked upon the detection of wake phrase and
`inference_callback` is invoked upon completion of follow-on voice command inference.

When instantiated, valid sample rate can be obtained via `sample_rate()`.
Expected number of audio samples per frame is `frame_length()`.
The engine accepts 16-bit linearly-encoded PCM and operates on single-channel audio:

```rust
fn next_audio_frame() -> Vec<i16> {
    // get audio frame
}

loop {
    picovoice.process(&next_audio_frame()).expect("Picovoice failed to process audio");
}
```

### C

Picovoice is implemented in ANSI C and therefore can be directly linked to C applications. Its public header file ([sdk/c/include/pv_picovoice.h](sdk/c/include/pv_picovoice.h)) contains relevant information. An instance of the Picovoice object can be constructed as follows.

```c
const char* ACCESS_KEY = "${ACCESS_KEY}"; // AccessKey string obtained from [Picovoice Console](https://console.picovoice.ai/)

const char *porcupine_model_path = ... // Available at resources/porcupine/lib/common/porcupine_params.pv
const char *keyword_path = ...
const float porcupine_sensitivity = 0.5f;

const char *rhino_model_path = ... // Available at resources/rhino/lib/common/rhino_params.pv
const char *context_path = ...
const float rhino_sensitivity = 0.5f;
const bool require_endpoint = true;

static void wake_word_callback(void) {
    // take action upon detection of wake word
}

static void inference_callback(pv_inference_t *inference) {
    // `inference` exposes three immutable properties:
    // (1) `IsUnderstood`
    // (2) `Intent`
    // (3) `Slots`

    // take action based on inferred intent
    pv_inference_delete(inference);
}

pv_picovoice_t *handle = NULL;

pv_status_t status = pv_picovoice_init(
        access_key,
        porcupine_model_path,
        keyword_path,
        porcupine_sensitivity,
        wake_word_callback,
        rhino_model_path,
        context_path,
        rhino_sensitivity,
        require_endpoint,
        inference_callback,
        &handle);

if (status != PV_STATUS_SUCCESS) {
    // error handling logic
}
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating-point number
within [0, 1]. A higher sensitivity reduces miss rate (false reject rate) at cost of increased false alarm rate.

`handle` is an instance of Picovoice runtime engine that detects utterances of the wake phrase provided by `keyword_path`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within the context defined in `context_path`. `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is invoked upon completion of follow-on voice command inference.

Picovoice accepts single channel, 16-bit PCM audio. The sample rate can be retrieved using `pv_sample_rate()`. Finally, Picovoice accepts input audio in consecutive chunks
(aka frames) the length of each frame can be retrieved using `pv_porcupine_frame_length()`.

```c
extern const int16_t *get_next_audio_frame(void);

while (true) {
    const int16_t *pcm = get_next_audio_frame();
    const pv_status_t status = pv_picovoice_process(handle, pcm);
    if (status != PV_STATUS_SUCCESS) {
        // error handling logic
    }
}
```

Finally, when done be sure to release the acquired resources.

```c
pv_picovoice_delete(handle);
```

### Microcontroller

Picovoice is implemented in ANSI C and therefore can be directly linked to embedded C projects. Its public header file contains relevant information. An instance of the Picovoice object can be constructed as follows:

```c
#define MEMORY_BUFFER_SIZE ...
static uint8_t memory_buffer[MEMORY_BUFFER_SIZE] __attribute__((aligned(16)));

static const uint8_t *keyword_array = ...
const float porcupine_sensitivity = 0.5f

static void wake_word_callback(void) {
    // logic to execute upon detection of wake word
}

static const uint8_t *context_array = ...
const float rhino_sensitivity = 0.75f

static void inference_callback(pv_inference_t *inference) {
    // `inference` exposes three immutable properties:
    // (1) `IsUnderstood`
    // (2) `Intent`
    // (3) `Slots`
    // ..
    pv_inference_delete(inference);
}

pv_picovoice_t *handle = NULL;

const pv_status_t status = pv_picovoice_init(
        MEMORY_BUFFER_SIZE,
        memory_buffer,
        sizeof(keyword_array),
        keyword_array,
        porcupine_sensitivity,
        wake_word_callback,
        sizeof(context_array),
        context_array,
        rhino_sensitivity,
        inference_callback,
        &handle);

if (status != PV_STATUS_SUCCESS) {
    // error handling logic
}
```

Sensitivity is the parameter that enables developers to trade miss rate for false alarm. It is a floating-point number
within [0, 1]. A higher sensitivity reduces miss rate (false reject rate) at cost of increased false alarm rate.

`handle` is an instance of Picovoice runtime engine that detects utterances of wake phrase defined in `keyword_array`. Upon detection of wake word it starts inferring user's intent from the follow-on voice command within the context defined in `context_array`. `wake_word_callback` is invoked upon the detection of wake phrase and `inference_callback` is invoked upon completion of follow-on voice command inference.

Picovoice accepts single channel, 16-bit PCM audio. The sample rate can be retrieved using `pv_sample_rate()`. Finally, Picovoice accepts input audio in consecutive chunks
(aka frames) the length of each frame can be retrieved using `pv_porcupine_frame_length()`.

```c
extern const int16_t *get_next_audio_frame(void);

while (true) {
    const int16_t *pcm = get_next_audio_frame();
    const pv_status_t status = pv_picovoice_process(handle, pcm);
    if (status != PV_STATUS_SUCCESS) {
        // error handling logic
    }
}
```

Finally, when done be sure to release the acquired resources.

```c
pv_picovoice_delete(handle);
```

## Releases

### v2.2.0 - April 12th, 2023

- Added language support for Arabic, Dutch, Hindi, Mandarin, Polish, Russian, Swedish and Vietnamese
- Added support for .NET 7.0 and fixed support for .NET Standard 2.0
- iOS minimum support moved to 11.0
- Improved stability and performance

### v2.1.0 - January 20th, 2022

- macOS arm64 (Apple Silicon) support added for Java and Unity SDKs
- Various bug fixes and improvements

### v2.0.0 - November 25th, 2021
- Improved accuracy.
- Added Rust SDK.
- macOS arm64 support.
- Added NodeJS support for Windows, NVIDIA Jetson Nano, and BeagleBone.
- Added .NET support for NVIDIA Jetson Nano and BeagleBone.
- Runtime optimization.

### v1.1.0 - December 2nd, 2020

- Improved accuracy.
- Runtime optimizations.
- .NET SDK.
- Java SDK.
- React Native SDK.
- C SDK.

### v1.0.0 - October 22, 2020

- Initial release.

## FAQ

You can find the FAQ [here](https://picovoice.ai/docs/faq/picovoice/).
