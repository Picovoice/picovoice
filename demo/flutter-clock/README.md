# PicoClock

A voice-controlled clock app made with Flutter and the Picovoice end-to-end voice platform.

Before running the demo, run the `copy.sh` script to copy wake word and context files from elsewhere in the repo.

## AccessKey

All demos require a valid Picovoice `AccessKey` at initialization. `AccessKey`s act as your credentials when using Picovoice SDKs.
You can create your `AccessKey` for free. Make sure to keep your `AccessKey` secret.

To obtain your `AccessKey`:
1. Login or Signup for a free account on the [Picovoice Console](https://console.picovoice.ai/).
2. Once logged in, go to the [`AccessKey` tab](https://console.picovoice.ai/access_key) to create one or use an existing `AccessKey`.

Once you obtain your `AccessKey`, replace it in [lib/main.dart](lib/main.dart) file:

```dart
final String accessKey = "{YOUR_ACCESS_KEY_HERE}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
```

Run the following command from [demo/flutter-clock](.) to build and deploy the demo to your device:
```console
flutter run
```