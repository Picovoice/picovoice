//
// Copyright 2021 Picovoice Inc.
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
import 'package:picovoice/picovoice.dart';
import 'package:picovoice/picovoice_error.dart';

class PicovoiceManager {
  Picovoice? _picovoice;
  VoiceProcessor? _voiceProcessor;
  RemoveListener? _removeVoiceProcessorListener;
  ErrorCallback? _errorCallback;

  String? _porcupineModelPath;
  String _keywordPath;
  double _porcupineSensitivity = 0.5;
  WakeWordCallback _wakeWordCallback;

  String? _rhinoModelPath;
  String _contextPath;
  double _rhinoSensitivity = 0.5;
  InferenceCallback _inferenceCallback;

  /// Picovoice constructor
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
  /// returns an instance of the Picovoice end-to-end platform.
  static create(String keywordPath, WakeWordCallback wakeWordCallback,
      String contextPath, InferenceCallback inferenceCallback,
      {double porcupineSensitivity = 0.5,
      double rhinoSensitivity = 0.5,
      String? porcupineModelPath,
      String? rhinoModelPath,
      ErrorCallback? errorCallback}) {
    return new PicovoiceManager._(
        keywordPath,
        wakeWordCallback,
        contextPath,
        inferenceCallback,
        porcupineSensitivity,
        rhinoSensitivity,
        porcupineModelPath,
        rhinoModelPath,
        errorCallback);
  }

  // private constructor
  PicovoiceManager._(
      this._keywordPath,
      this._wakeWordCallback,
      this._contextPath,
      this._inferenceCallback,
      this._porcupineSensitivity,
      this._rhinoSensitivity,
      this._porcupineModelPath,
      this._rhinoModelPath,
      this._errorCallback)
      : _voiceProcessor = VoiceProcessor.getVoiceProcessor(
            Picovoice.frameLength, Picovoice.sampleRate);

  /// Opens audio input stream and sends audio frames to Picovoice.
  /// Throws a `PvAudioException` if there was a problem starting the audio engine.
  /// Throws a `PvError` if an instance of Picovoice could not be created.
  Future<void> start() async {
    if (_picovoice != null) {
      return;
    }

    _picovoice = await Picovoice.create(
        _keywordPath, _wakeWordCallback, _contextPath, _inferenceCallback,
        porcupineSensitivity: _porcupineSensitivity,
        rhinoSensitivity: _rhinoSensitivity,
        porcupineModelPath: _porcupineModelPath,
        rhinoModelPath: _rhinoModelPath);

    if (_voiceProcessor == null) {
      throw new PvError("flutter_voice_processor not available.");
    }
    _removeVoiceProcessorListener =
        _voiceProcessor!.addListener((buffer) async {
      // cast from dynamic to int array
      List<int> picovoiceFrame;
      try {
        picovoiceFrame = (buffer as List<dynamic>).cast<int>();
      } on Error {
        PvError castError = new PvError(
            "flutter_voice_processor sent an unexpected data type.");
        _errorCallback == null
            ? print(castError.message)
            : _errorCallback!(castError);
        return;
      }

      // process frame with Picovoice
      try {
        _picovoice?.process(picovoiceFrame);
      } on PvError catch (error) {
        _errorCallback == null ? print(error.message) : _errorCallback!(error);
      }
    });

    if (await _voiceProcessor?.hasRecordAudioPermission() != null) {
      try {
        // create picovoice
        await _voiceProcessor!.start();
      } on PlatformException {
        throw new PvAudioException(
            "Audio engine failed to start. Hardware may not be supported.");
      }
    } else {
      throw new PvAudioException(
          "User did not give permission to record audio.");
    }
  }

  /// Closes audio stream and stops Picovoice processing
  Future<void> stop() async {
    if (_voiceProcessor?.isRecording ?? false) {
      await _voiceProcessor!.stop();
    }
    _removeVoiceProcessorListener?.call();

    _picovoice?.delete();
    _picovoice = null;
  }
}
