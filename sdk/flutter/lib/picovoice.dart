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

import 'picovoice_error.dart';
import 'package:porcupine_flutter/porcupine.dart';
import 'package:porcupine_flutter/porcupine_error.dart';
import 'package:rhino_flutter/rhino.dart';
import 'package:rhino_flutter/rhino_error.dart';

typedef WakeWordCallback = Function();
typedef InferenceCallback = Function(RhinoInference inference);

class Picovoice {
  Porcupine? _porcupine;
  final WakeWordCallback _wakeWordCallback;
  Rhino? _rhino;
  final InferenceCallback _inferenceCallback;
  bool _isWakeWordDetected = false;

  /// The required number of audio samples per frame
  int? get frameLength => _porcupine?.frameLength;

  /// The required audio sample rate
  int? get sampleRate => _porcupine?.sampleRate;

  /// Version of Picovoice
  String get version => "2.2.0";

  /// Version of Porcupine
  String? get porcupineVersion => _porcupine?.version;

  /// Version of Rhino
  String? get rhinoVersion => _rhino?.version;

  /// Gets the source of the Rhino context in YAML format. Shows the list of intents,
  /// which expressions map to those intents, as well as slots and their possible values.
  String? get contextInfo => _rhino?.contextInfo;

  /// Static creator for initializing Picovoice
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
  /// accepts a single input argument of type `RhinoInference` that is populated with the following items:
  /// (1) `isUnderstood`: whether Rhino understood what it heard based on the context
  /// (2) `intent`: if isUnderstood, name of intent that were inferred
  /// (3) `slots`: if isUnderstood, dictionary of slot keys and values that were inferred
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
      bool requireEndpoint = true}) async {
    Porcupine porcupine;
    try {
      porcupine = await Porcupine.fromKeywordPaths(accessKey, [keywordPath],
          modelPath: porcupineModelPath, sensitivities: [porcupineSensitivity]);
    } on PorcupineException catch (ex) {
      throw mapToPicovoiceException(ex, ex.message);
    }

    Rhino rhino;
    try {
      rhino = await Rhino.create(accessKey, contextPath,
          modelPath: rhinoModelPath,
          sensitivity: rhinoSensitivity,
          endpointDurationSec: endpointDurationSec,
          requireEndpoint: requireEndpoint);
    } on RhinoException catch (ex) {
      throw mapToPicovoiceException(ex, ex.message);
    }

    if (porcupine.frameLength != rhino.frameLength) {
      throw PicovoiceInvalidArgumentException(
          "Porcupine frame length ${porcupine.frameLength} and Rhino frame length ${rhino.frameLength} are different.");
    }

    if (porcupine.sampleRate != rhino.sampleRate) {
      throw PicovoiceInvalidArgumentException(
          "Porcupine sample rate ${porcupine.sampleRate} and Rhino sample rate ${rhino.sampleRate} are different.");
    }

    return Picovoice._(porcupine, wakeWordCallback, rhino, inferenceCallback);
  }

  // private constructor
  Picovoice._(this._porcupine, this._wakeWordCallback, this._rhino,
      this._inferenceCallback);

  ///
  /// Processes a frame of the incoming audio stream. Upon detection of wake word and completion of follow-on command
  /// inference invokes user-defined callbacks.
  ///
  /// [frame] A frame of audio samples. The number of samples per frame can be attained by calling
  /// `.frameLength`. The incoming audio needs to have a sample rate equal to `.sample_rate` and be 16-bit linearly-encoded.
  /// Picovoice operates on single-channel audio.
  void process(List<int> frame) async {
    if (_porcupine == null || _rhino == null) {
      throw PicovoiceInvalidStateException(
          "Cannot process frame - resources have been released.");
    }

    if (frame.length != frameLength) {
      throw PicovoiceInvalidArgumentException(
          "Picovoice process requires frames of length $frameLength. Received frame of size ${frame.length}.");
    }

    if (!_isWakeWordDetected) {
      final int keywordIndex = await _porcupine!.process(frame);
      if (keywordIndex >= 0) {
        _isWakeWordDetected = true;
        _wakeWordCallback();
      }
    } else {
      RhinoInference inference = await _rhino!.process(frame);
      if (inference.isFinalized) {
        _isWakeWordDetected = false;
        _inferenceCallback(inference);
      }
    }
  }

  /// Release the resources acquired by Picovoice (via Porcupine and Rhino engines).
  void delete() {
    if (_porcupine != null) {
      _porcupine!.delete();
      _porcupine = null;
    }
    if (_rhino != null) {
      _rhino!.delete();
      _rhino = null;
    }
  }
}
