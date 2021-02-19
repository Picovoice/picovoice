# Picovoice SDK for Unity

# Picovoice

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Picovoice is an end-to-end platform for building voice products on your terms. It enables creation of voice experiences
similar to Alexa and Google, except it entirely runs 100% on-device. 

Picovoice is:

- **Private:** Everything is processed offline. Intrinsically HIPAA and GDPR compliant.
- **Reliable:** Runs without needing constant connectivity.
- **Zero Latency:** Edge-first architecture eliminates unpredictable network delay.
- **Accurate:** Resilient to noise and reverberation. It outperforms cloud-based alternatives by wide margins
[*](https://github.com/Picovoice/speech-to-intent-benchmark#results).
- **Cross-Platform:** Design once, deploy anywhere. Build using familiar languages and frameworks.

## Compatibility

This binding is for running Picovoice on **Unity 2017.4+** on the following platforms:

- Android 4.1+ (API 16+) (ARM only)
- iOS 9.0+
- Windows (x86_64)
- macOS (x86_64)
- Linux (x86_64)

## Installation

The easiest way to install the Picovoice Unity SDK is to import [picovoice.unitypackage](/sdk/unity/picovoice.unitypackage) into your Unity project by either dropping it into the Unity editor or going to _Assets>Import Package>Custom Package..._

## Packaging
To build the package from source, you have first have to clone the repo with submodules:
```bash
git clone --recurse-submodules git@github.com:Picovoice/picovoice.git
# or 
git clone --recurse-submodules https://github.com/Picovoice/picovoice.git
```

You then have to run the `copy.sh` file to copy the package resources from various locations in the repo to the Unity project located at [/sdk/unity](/sdk/unity) (**NOTE:** on Windows, Git Bash or another bash shell is required, or you will have to manually copy the resources into the project.). Then, open the Unity project, right click the Assets folder and select Export Package. The resulting Unity package can be imported into other Unity projects as desired.

## Usage

The module provides you with two levels of API to choose from depending on your needs.

#### High-Level API

[PicovoiceManager](/sdk/unity/Assets/Picovoice/PicovoiceManager.cs) provides a high-level API that takes care of audio recording. This class is the quickest way to get started.

>**NOTE:** If running on iOS, you must fill in the Microphone Usage Description under Project Settings>Other Settings in order to enable audio recording.

The constructor `PicovoiceManager.Create` will create an instance of the PicovoiceManager using the Porcupine keyword and Rhino context files that you pass to it.
```csharp
using Pv.Unity;

try 
{    
    PicovoiceManager _picovoiceManager = PicovoiceManager.Create(
                                    "/path/to/keyword/file.ppn",
                                    OnWakeWordDetected,
                                    "/path/to/context/file.rhn",
                                    OnInferenceResult);
}
catch (Exception ex)
{
    // handle picovoice init error
}
```
The `wakeWordCallback` and `inferenceCallback` arguments are functions that you want to execute when a wake word is detected and when an inference is made.

```csharp
private void OnWakeWordDetected(int keywordIndex)
{
    if(keywordIndex >= 0)
    {
        // wake word detected!
    }
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

You can override the default model files and sensitivities. There is also an optional errorCallback that is called if there is a problem encountered while processing audio. These optional parameters can be passed in like so:

```csharp
PicovoiceManager _picovoiceManager = PicovoiceManager.Create(
                                        "/path/to/keyword/file.ppn",
                                        OnWakeWordDetected,
                                        "/path/to/context/file.rhn",
                                        OnInferenceResult
                                        porcupineModelPath: "/path/to/porcupine/model.pv",
                                        porcupineSensitivity: 0.75f,
                                        rhinoModelPath: "/path/to/rhino/model.pv",
                                        rhinoSensitivity: 0.6f,
                                        errorCallback: OnError);

void OnError(Exception ex){
    Debug.LogError(ex.ToString());
}
```

Once you have instantiated a PicovoiceManager, you can start audio capture and processing by calling:
```csharp
_picovoiceManager.Start();
```

And then stop it by calling:
```csharp
_picovoiceManager.Stop();
```

Once the app is done with using an instance of PicovoiceManager, you can explicitly release the audio resources and the resources allocated to Picovoice:
```csharp
_picovoiceManager.Delete();
```

PicovoiceManager uses our
[unity-voice-processor](https://github.com/Picovoice/unity-voice-processor/)
Unity package to capture frames of audio and automatically pass it to the Picovoice platform.

#### Low-Level API

[Picovoice](/sdk/unity/Assets/Picovoice/Picovoice.cs) provides low-level access to the Picovoice platform for those
who want to incorporate it into a already existing audio processing pipeline.

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

private void OnWakeWordDetected(int keywordIndex)
{
    if(keywordIndex >= 0)
    {
        // wake word detected!
    }
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
catch (Exception ex)
{
    Debug.LogError(ex.ToString());
}  
```

For process to work correctly, the audio data must be in the audio format required by Picovoice.
The required audio format is found by calling `.sampleRate` to get the required sample rate and `.frameLength` to get the required frame size. Audio must be single-channel and 16-bit linearly-encoded.

Picovoice implements the `IDisposable` interface, so you can use Picovoice in a `using` block. If you don't use a `using` block, resources will be released by the garbage collector automatically or you can explicitly release the resources like so:

```csharp
_picovoice.Dispose();
```

## Demo

The Picovoice Unity demo can be imported along with the SDK when you import the Picovoice Unity package. Browse the source of the demo [here](/demo/unity).