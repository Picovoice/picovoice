# Picovoice SDK for Unity

# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creation of voice experiences
similar to Alexa and Google, except it entirely runs 100% on-device.

Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR-compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

[Picovoice unity package](./picovoice-2.2.1.unitypackage) is for running Picovoice on **Unity 2017.4+** on the following platforms:

- Android 5.0+ (API 21+) (ARM only)
- iOS 11.0+
- Windows (x86_64)
- macOS (x86_64)
- Linux (x86_64)

 For running Picovoice on **macOS m1 (arm64)**, use the [Apple silicon](./picovoice-2.2.1-Apple-silicon.unitypackage) version on **Unity 2021.2+**.

## Installation

The easiest way to install the Picovoice Unity SDK is to import the latest [Picovoice Unity package](.) into your Unity projects by either dropping it into the Unity editor or going to _Assets>Import Package>Custom Package..._

## AccessKey

Picovoice requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Picovoice SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Packaging
To build the package from source, you first have to clone the repo with submodules:
```console
git clone --recurse-submodules git@github.com:Picovoice/picovoice.git
# or
git clone --recurse-submodules https://github.com/Picovoice/picovoice.git
```

You then have to run the `copy.sh` file to copy the package resources from various locations in the repo to the Unity project located at [/sdk/unity](.) (**NOTE:** on Windows, Git Bash or another bash shell is required, or you will have to manually copy the resources into the project.). Then, open the Unity project, right-click the Assets folder and select Export Package. The resulting Unity package can be imported into other Unity projects as desired.

## Usage

The module provides you with two levels of API to choose from depending on your needs.

#### High-Level API

[PicovoiceManager](./Assets/Picovoice/PicovoiceManager.cs) provides a high-level API that takes care of audio recording. This class is the quickest way to get started.

>**NOTE:** If running on iOS, you must fill in the Microphone Usage Description under Project Settings>Other Settings in order to enable audio recording.

The constructor will create an instance of the PicovoiceManager using the Porcupine keyword and Rhino context files that you pass to it.
```csharp
using Pv.Unity;

string accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

PicovoiceManager _picovoiceManager = new PicovoiceManager.Create(
                                accessKey,
                                "/path/to/keyword/file.ppn",
                                OnWakeWordDetected,
                                "/path/to/context/file.rhn",
                                OnInferenceResult);
```
The `wakeWordCallback` and `inferenceCallback` arguments are functions that you want to execute when a wake word is detected and when an inference is made.

```csharp
private void OnWakeWordDetected()
{
    // wake word detected!
}

private void OnInferenceResult(Inference inference)
{
    if(inference.IsUnderstood)
    {
        string intent = inference.Intent;
        Dictionary<string, string> slots = inference.Slots;
        // add code to take action based on inferred intent and slot values
    }
    else
    {
        // add code to handle unsupported commands
    }
}
```

You can override the default model files and sensitivities. You can set `requireEndpoint` parameter to false if you do not wish to wait for silence before Rhino infers context. There is also an optional `processErrorCallback` that is called if there is a problem encountered while processing audio. These optional parameters can be passed in like so:

```csharp
string accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

PicovoiceManager _picovoiceManager = new PicovoiceManager.Create(
                                        accessKey,
                                        "/path/to/keyword/file.ppn",
                                        OnWakeWordDetected,
                                        "/path/to/context/file.rhn",
                                        OnInferenceResult
                                        porcupineModelPath: "/path/to/porcupine/model.pv",
                                        porcupineSensitivity: 0.75f,
                                        rhinoModelPath: "/path/to/rhino/model.pv",
                                        rhinoSensitivity: 0.6f,
                                        requireEndpoint: false,
                                        processErrorCallback: OnError);

void OnError(PicovoiceException ex){
    Debug.LogError(ex.ToString());
}
```

Once you have instantiated a PicovoiceManager, you can start audio capture and processing by calling:
```csharp
try
{
    _picovoiceManager.Start();
}
catch(PicovoiceException ex)
{
    Debug.LogError(ex.ToString());
}
```

And then stop it by calling:
```csharp
_picovoiceManager.Stop();
```

PicovoiceManager uses our
[unity-voice-processor](https://github.com/Picovoice/unity-voice-processor/)
Unity package to capture frames of audio and automatically pass it to the Picovoice platform.

#### Low-Level API

[Picovoice](./Assets/Picovoice/Picovoice.cs) provides low-level access to the Picovoice platform for those
who want to incorporate it into an already existing audio processing pipeline.

`Picovoice` is created by passing a Porcupine keyword file and Rhino context file to the `Create` static constructor.

```csharp
using Pv.Unity;

string accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)

try
{
    Picovoice _picovoice = Picovoice.Create(
                                accessKey,
                                "path/to/keyword/file.ppn",
                                OnWakeWordDetected,
                                "path/to/context/file.rhn",
                                OnInferenceResult);
}
catch (PicovoiceException ex)
{
    // handle Picovoice init error
}

private void OnWakeWordDetected()
{
    // wake word detected!
}

private void OnInferenceResult(Inference inference)
{
    if(inference.IsUnderstood)
    {
        string intent = inference.Intent;
        Dictionary<string, string> slots = inference.Slots;
        // add code to take action based on inferred intent and slot values
    }
    else
    {
        // add code to handle unsupported commands
    }
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
catch (PicovoiceException ex)
{
    Debug.LogError(ex.ToString());
}
```

For process to work correctly, the audio data must be in the audio format required by Picovoice.
The required audio format is found by calling `.sampleRate` to get the required sample rate and `.frameLength` to get the required frame size. Audio must be single-channel and 16-bit linearly-encoded.

Picovoice implements the `IDisposable` interface, so you can use Picovoice in a `using` block. If you don't use a `using` block, resources will be released by the garbage collector automatically, or you can explicitly release the resources like so:

```csharp
_picovoice.Dispose();
```

## Custom Model Integration

To add custom models to your Unity app, you'll need to add them to your project root under `/StreamingAssets`. Then, in a script, retrieve them like so:
```csharp

string keywordPath = Path.Combine(Application.streamingAssetsPath, "keyword.ppn");
string contextPath = Path.Combine(Application.streamingAssetsPath, "context.rhn");
```

## Non-English Models

In order to detect wake words and run inference in other languages you need to use the corresponding model file. The model files for all supported languages are available [here](https://github.com/Picovoice/porcupine/tree/master/lib/common) and [here](https://github.com/Picovoice/rhino/tree/master/lib/common).

## Demo

The Picovoice Unity demo can be imported along with the SDK when you import the Picovoice Unity package. Browse the source of the demo [here](../../demo/unity).
