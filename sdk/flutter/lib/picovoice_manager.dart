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
  VoiceProcessor? _voiceProcessor;
  RemoveListener? _removeVoiceProcessorListener;
  RemoveListener? _removeErrorListener;
  final ProcessErrorCallback? _processErrorCallback;

  final String _accessKey;

  final String? _porcupineModelPath;
  final String _keywordPath;
  final double _porcupineSensitivity;
  final WakeWordCallback _wakeWordCallback;

  final String? _rhinoModelPath;
  final String _contextPath;
  final double _rhinoSensitivity;
  final InferenceCallback _inferenceCallback;
  final double _endpointDurationSec;
  final bool _requireEndpoint;

  /// Gets the source of the Rhino context in YAML format. Shows the list of intents,
  /// which expressions map to those intents, as well as slots and their possible values.
  /// Only available after a call to `.start()`.
  String? get contextInfo => _picovoice?.contextInfo;

  /// Picovoice constructor
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
  static create(
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
      ProcessErrorCallback? processErrorCallback}) {
    return PicovoiceManager._(
        accessKey,
        keywordPath,
        wakeWordCallback,
        contextPath,
        inferenceCallback,
        porcupineSensitivity,
        rhinoSensitivity,
        porcupineModelPath,
        rhinoModelPath,
        endpointDurationSec,
        requireEndpoint,
        processErrorCallback);
  }

  // private constructor
  PicovoiceManager._(
      this._accessKey,
      this._keywordPath,
      this._wakeWordCallback,
      this._contextPath,
      this._inferenceCallback,
      this._porcupineSensitivity,
      this._rhinoSensitivity,
      this._porcupineModelPath,
      this._rhinoModelPath,
      this._endpointDurationSec,
      this._requireEndpoint,
      this._processErrorCallback);

  /// Opens audio input stream and sends audio frames to Picovoice.
  /// Throws a `PvAudioException` if there was a problem starting the audio engine.
  /// Throws a `PvError` if an instance of Picovoice could not be created.
  Future<void> start() async {
    if (_picovoice != null) {
      return;
    }

    _picovoice = await Picovoice.create(_accessKey, _keywordPath,
        _wakeWordCallback, _contextPath, _inferenceCallback,
        porcupineSensitivity: _porcupineSensitivity,
        rhinoSensitivity: _rhinoSensitivity,
        porcupineModelPath: _porcupineModelPath,
        rhinoModelPath: _rhinoModelPath,
        endpointDurationSec: _endpointDurationSec,
        requireEndpoint: _requireEndpoint);

    _voiceProcessor ??= VoiceProcessor.getVoiceProcessor(
        _picovoice!.frameLength!, _picovoice!.sampleRate!);

    if (_voiceProcessor == null) {
      throw PicovoiceRuntimeException("flutter_voice_processor not available.");
    }
    _removeVoiceProcessorListener =
        _voiceProcessor!.addListener((buffer) async {
      // cast from dynamic to int array
      List<int> picovoiceFrame;
      try {
        picovoiceFrame = (buffer as List<dynamic>).cast<int>();
      } on Error {
        PicovoiceException castError = PicovoiceException(
            "flutter_voice_processor sent an unexpected data type.");
        _processErrorCallback == null
            ? print(castError.message)
            : _processErrorCallback!(castError);
        return;
      }

      // process frame with Picovoice
      try {
        _picovoice?.process(picovoiceFrame);
      } on PicovoiceException catch (error) {
        _processErrorCallback == null
            ? print(error.message)
            : _processErrorCallback!(error);
      }
    });

    _removeErrorListener = _voiceProcessor!.addErrorListener((errorMsg) {
      PicovoiceException nativeError = PicovoiceException(errorMsg as String);
      _processErrorCallback == null
          ? print(nativeError.message)
          : _processErrorCallback!(nativeError);
    });

    if (await _voiceProcessor?.hasRecordAudioPermission() ?? false) {
      try {
        // create picovoice
        await _voiceProcessor!.start();
      } on PlatformException {
        throw PicovoiceRuntimeException(
            "Audio engine failed to start. Hardware may not be supported.");
      }
    } else {
      throw PicovoiceInvalidStateException(
          "User did not give permission to record audio.");
    }
  }

  /// Closes audio stream and stops Picovoice processing
  Future<void> stop() async {
    if (_voiceProcessor?.isRecording ?? false) {
      await _voiceProcessor!.stop();
    }
    _removeVoiceProcessorListener?.call();
    _removeErrorListener?.call();

    _picovoice?.delete();
    _picovoice = null;
  }
}
