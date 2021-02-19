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

import 'picovoice_error.dart';
import 'package:porcupine/porcupine.dart';
import 'package:porcupine/porcupine_error.dart' as porcupineErr;
import 'package:rhino/rhino.dart';
import 'package:rhino/rhino_error.dart' as rhinoErr;

typedef WakeWordCallback(int keywordIndex);
typedef InferenceCallback(Map<String, dynamic> inference);
typedef ErrorCallback(PvError error);

class Picovoice {
  Porcupine _porcupine;
  WakeWordCallback _wakeWordCallback;
  Rhino _rhino;
  InferenceCallback _inferenceCallback;
  bool _isWakeWordDetected = false;

  /// The required number of audio samples per frame
  int get frameLength => _porcupine?.frameLength;

  /// The required audio sample rate
  int get sampleRate => _porcupine?.sampleRate;

  /// Version of Picovoice
  String get version => "1.1.0";

  /// Version of Porcupine
  String get porcupineVersion => _porcupine?.version;

  /// Version of Rhino
  String get rhinoVersion => _rhino?.version;

  /// Gets the source of the Rhino context in YAML format. Shows the list of intents,
  /// which expressions map to those intents, as well as slots and their possible values.
  String get contextInfo => _rhino?.contextInfo;

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
  /// returns an instance of the Picovoice end-to-end platform.
  static create(String keywordPath, WakeWordCallback wakeWordCallback,
      String contextPath, InferenceCallback inferenceCallback,
      {double porcupineSensitivity = 0.5,
      double rhinoSensitivity = 0.5,
      String porcupineModelPath,
      String rhinoModelPath}) async {
    Porcupine porcupine;
    try {
      porcupine = await Porcupine.fromKeywordPaths([keywordPath],
          modelPath: porcupineModelPath, sensitivities: [porcupineSensitivity]);
    } on porcupineErr.PvError catch (ex) {
      throw new PvError("${ex.runtimeType}: ${ex.message}");
    }

    Rhino rhino;
    try {
      rhino = await Rhino.create(contextPath,
          modelPath: rhinoModelPath, sensitivity: rhinoSensitivity);
    } on rhinoErr.PvError catch (ex) {
      throw new PvError("${ex.runtimeType}: ${ex.message}");
    }

    if (porcupine.frameLength != rhino.frameLength) {
      throw new PvArgumentError(
          "Porcupine and Rhino frame lengths are different.");
    }

    if (porcupine.sampleRate != rhino.sampleRate) {
      throw new PvArgumentError(
          "Porcupine and Rhino sample rates are different.");
    }

    return new Picovoice._(
        porcupine, wakeWordCallback, rhino, inferenceCallback);
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
  void process(List<int> frame) {
    if (_porcupine == null || _rhino == null) {
      throw new PvStateError(
          "Cannot process frame - resources have been released.");
    }

    if (!_isWakeWordDetected) {
      final int keywordIndex = _porcupine.process(frame);
      if (keywordIndex >= 0) {
        _isWakeWordDetected = true;
        _wakeWordCallback(keywordIndex);
      }
    } else {
      Map<String, dynamic> rhinoResult = _rhino.process(frame);
      if (rhinoResult['isFinalized']) {
        _isWakeWordDetected = false;
        rhinoResult.remove('isFinalized');

        _inferenceCallback(rhinoResult);
      }
    }
  }

  /// Release the resources acquired by Picovoice (via Porcupine and Rhino engines).
  void delete() {
    if (_porcupine != null) {
      _porcupine.delete();
      _porcupine = null;
    }
    if (_rhino != null) {
      _rhino.delete();
      _rhino = null;
    }
  }
}
