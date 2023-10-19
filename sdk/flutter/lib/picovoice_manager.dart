//
// Copyright 2021-2023 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import 'package:flutter/services.dart';
import 'package:flutter_voice_processor/flutter_voice_processor.dart';
import 'package:picovoice_flutter/picovoice.dart';
import 'package:picovoice_flutter/picovoice_error.dart';

typedef ProcessErrorCallback = Function(PicovoiceException error);

class PicovoiceManager {
  Picovoice? _picovoice;
  final VoiceProcessor? _voiceProcessor;

  late VoiceProcessorFrameListener _frameListener;
  late VoiceProcessorErrorListener _errorListener;

  final ProcessErrorCallback? _processErrorCallback;

  bool _isListening = false;

  /// Gets the source of the Rhino context in YAML format. Shows the list of intents,
  /// which expressions map to those intents, as well as slots and their possible values.
  /// Only available after a call to `.start()`.
  String? get contextInfo => _picovoice?.contextInfo;

  /// Picovoice constructor.
  ///
  /// [accessKey] AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).
  ///
  /// [keywordPath] Absolute path to Porcupine's keyword model file.
  ///
  /// [wakeWordCallback] User-defined callback invoked upon detection of the wake phrase.
  /// The callback accepts no input arguments.
  ///
  /// [contextPath] Absolute path to file containing context parameters. A context represents the set of
  /// expressions(spoken commands), intents, and intent arguments(slots) within a domain of interest.
  ///
  /// [inferenceCallback] User-defined callback invoked upon completion of intent inference. The callback
  /// accepts a single input argument of type `Map<String, dynamic>` that is populated with the following items:
  /// (2) `isUnderstood`: if isFinalized, whether Rhino understood what it heard based on the context
  /// (3) `intent`: if isUnderstood, name of intent that were inferred
  /// (4) `slots`: if isUnderstood, dictionary of slot keys and values that were inferred
  ///
  /// [porcupineModelPath] Absolute path to the file containing Porcupine's model parameters.
  ///
  /// [porcupineSensitivity] Wake word detection sensitivity. It should be a number within [0, 1]. A higher
  /// sensitivity results in fewer misses at the cost of increasing the false alarm rate.
  ///
  /// [rhinoModelPath] Absolute path to the file containing Rhino's model parameters.
  ///
  /// [rhinoSensitivity] Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
  /// results in fewer misses at the cost of(potentially) increasing the erroneous inference rate.
  ///
  /// [endpointDurationSec] (Optional) Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
  /// utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
  /// duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return inference
  /// pre-emptively in case the user pauses before finishing the request.
  ///
  /// [requireEndpoint] (Optional) If set to `true`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
  /// If set to `false`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless. Set
  /// to `false` only if operating in an environment with overlapping speech (e.g. people talking in the background).
  ///
  /// [processErrorCallback] Reports errors that are encountered while
  /// the engine is processing audio.
  ///
  /// returns an instance of the Picovoice end-to-end platform.
  static Future<PicovoiceManager> create(
      String accessKey,
      String keywordPath,
      WakeWordCallback wakeWordCallback,
      String contextPath,
      InferenceCallback inferenceCallback,
      {double porcupineSensitivity = 0.5,
      double rhinoSensitivity = 0.5,
      String? porcupineModelPath,
      String? rhinoModelPath,
      double endpointDurationSec = 1.0,
      bool requireEndpoint = true,
      ProcessErrorCallback? processErrorCallback}) async {
    Picovoice picovoice = await Picovoice.create(accessKey, keywordPath,
        wakeWordCallback, contextPath, inferenceCallback,
        porcupineSensitivity: porcupineSensitivity,
        rhinoSensitivity: rhinoSensitivity,
        porcupineModelPath: porcupineModelPath,
        rhinoModelPath: rhinoModelPath,
        endpointDurationSec: endpointDurationSec,
        requireEndpoint: requireEndpoint);

    return PicovoiceManager._(picovoice, processErrorCallback);
  }

  // private constructor
  PicovoiceManager._(this._picovoice, this._processErrorCallback)
      : _voiceProcessor = VoiceProcessor.instance {
    _frameListener = (List<int> frame) async {
      if (_picovoice == null || !_isListening) {
        return;
      }

      try {
        _picovoice?.process(frame);
      } on PicovoiceException catch (error) {
        _processErrorCallback == null
            ? print(error.message)
            : _processErrorCallback!(error);
      }
    };

    _errorListener = (VoiceProcessorException error) {
      _processErrorCallback == null
          ? print(error.message)
          : _processErrorCallback!(PicovoiceException(error.message));
    };
  }

  /// Opens audio input stream and sends audio frames to Picovoice.
  /// Throws a `PicovoiceException` if unable to start.
  Future<void> start() async {
    if (_picovoice == null) {
      throw PicovoiceInvalidStateException(
          "Unable to start - resources have been released.");
    }

    if (!_isListening) {
      if (await _voiceProcessor?.hasRecordAudioPermission() ?? false) {
        _voiceProcessor?.addFrameListener(_frameListener);
        _voiceProcessor?.addErrorListener(_errorListener);
        try {
          await _voiceProcessor?.start(
              _picovoice!.frameLength!, _picovoice!.sampleRate!);
          _isListening = true;
        } on PlatformException catch (e) {
          throw PicovoiceRuntimeException(
              "Failed to start audio recording: ${e.message}");
        }
      } else {
        throw PicovoiceRuntimeException(
            "User did not give permission to record audio.");
      }
    }
  }

  /// Closes audio stream and stops Picovoice processing.
  /// Throws a `PicovoiceException` if there was a problem stopping audio recording.
  Future<void> stop() async {
    if (_picovoice == null) {
      throw PicovoiceInvalidStateException(
          "Unable to stop - resources have been released.");
    }

    if (_isListening) {
      _voiceProcessor?.removeErrorListener(_errorListener);
      _voiceProcessor?.removeFrameListener(_frameListener);

      if (_voiceProcessor?.numFrameListeners == 0) {
        try {
          await _voiceProcessor?.stop();
        } on PlatformException catch (e) {
          throw PicovoiceRuntimeException(
              "Failed to stop audio recording: ${e.message}");
        }
      }

      _isListening = false;
    }

    await _picovoice?.reset();
  }

  /// Resets the internal state of PicovoiceManager. It can be called to
  /// return to the wake word detection state before an inference has completed.
  Future<void> reset() async {
    if (_picovoice == null) {
      throw PicovoiceInvalidStateException(
          "Unable to reset - resources have been released.");
    }

    await _picovoice?.reset();
  }

  /// Releases native resources that were allocated to PicovoiceManager.
  Future<void> delete() async {
    await _picovoice?.delete();
    _picovoice = null;
  }
}
