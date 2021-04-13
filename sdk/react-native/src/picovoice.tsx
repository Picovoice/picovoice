//
// Copyright 2020-2021 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import { Porcupine } from '@picovoice/porcupine-react-native';
import { Rhino } from '@picovoice/rhino-react-native';
type WakeWordCallback = () => void;
type InferenceCallback = (inference: object) => void;

class Picovoice {
  private _porcupine: Porcupine | null;
  private _wakeWordCallback: WakeWordCallback;
  private _rhino: Rhino | null;
  private _inferenceCallback: InferenceCallback;

  private _frameLength: number;
  private _sampleRate: number;
  private _version: string;
  private _isWakeWordDetected = false;

  /**
   * Picovoice constructor
   *
   * @param keywordPath Absolute path to Porcupine's keyword model file.
   * @param wakeWordCallback User-defined callback invoked upon detection of the wake phrase.
   * The callback accepts no input arguments.
   * @param contextPath Absolute path to file containing context parameters. A context represents the set of
   * expressions(spoken commands), intents, and intent arguments(slots) within a domain of interest.
   * @param inferenceCallback User-defined callback invoked upon completion of intent inference. The callback
   * accepts a single JSON that is populated with the following items:
   * (1) `isUnderstood`: if isFinalized, whether Rhino understood what it heard based on the context
   * (2) `intent`: if isUnderstood, name of intent that were inferred
   * (3) `slots`: if isUnderstood, dictionary of slot keys and values that were inferred
   * @param porcupineModelPath Absolute path to the file containing Porcupine's model parameters.
   * @param porcupineSensitivity Wake word detection sensitivity. It should be a number within [0, 1]. A higher
   * sensitivity results in fewer misses at the cost of increasing the false alarm rate.
   * @param rhinoModelPath Absolute path to the file containing Rhino's model parameters.
   * @param Inference sensitivity. It should be a number within [0, 1]. A higher sensitivity value
   * results in fewer misses at the cost of(potentially) increasing the erroneous inference rate.
   * @returns an instance of the Picovoice end-to-end platform.
   */
  public static async create(
    keywordPath: string,
    wakeWordCallback: WakeWordCallback,
    contextPath: string,
    inferenceCallback: InferenceCallback,
    porcupineSensitivity: number = 0.5,
    rhinoSensitivity: number = 0.5,
    porcupineModelPath?: string,
    rhinoModelPath?: string
  ) {
    let porcupine: Porcupine = await Porcupine.fromKeywordPaths(
      [keywordPath],
      porcupineModelPath,
      [porcupineSensitivity]
    );
    let rhino: Rhino = await Rhino.create(
      contextPath,
      rhinoModelPath,
      rhinoSensitivity
    );

    if (porcupine.frameLength !== rhino.frameLength) {
      throw new Error('Porcupine and Rhino frame lengths are different.');
    }

    if (porcupine.sampleRate !== rhino.sampleRate) {
      throw new Error('Porcupine and Rhino sample rates are different.');
    }

    return new Picovoice(porcupine, wakeWordCallback, rhino, inferenceCallback);
  }

  private constructor(
    porcupine: Porcupine,
    wakeWordCallback: WakeWordCallback,
    rhino: Rhino,
    inferenceCallback: InferenceCallback
  ) {
    this._porcupine = porcupine;
    this._wakeWordCallback = wakeWordCallback;
    this._rhino = rhino;
    this._inferenceCallback = inferenceCallback;
    this._frameLength = porcupine.frameLength;
    this._sampleRate = porcupine.sampleRate;
    this._version = '1.1.0';
  }

  /**
   * Processes a frame of the incoming audio stream. Upon detection of wake word and completion of follow-on command
   * inference invokes user-defined callbacks.
   *
   * @param frame A frame of audio samples. The number of samples per frame can be attained by calling
   * `.frameLength`. The incoming audio needs to have a sample rate equal to `.sample_rate` and be 16-bit linearly-encoded.
   * Picovoice operates on single-channel audio.
   */
  async process(frame: number[]) {
    if (this._porcupine === null || this._rhino === null) {
      throw new Error('Cannot process frame - resources have been released.');
    }

    if (!this._isWakeWordDetected) {
      const keywordIndex = await this._porcupine.process(frame);

      if (keywordIndex >= 0) {
        this._isWakeWordDetected = true;
        this._wakeWordCallback();
      }
    } else {
      const result = await this._rhino.process(frame);
      if (result['isFinalized'] === true) {
        this._isWakeWordDetected = false;
        delete result['isFinalized'];

        this._inferenceCallback(result);
      }
    }
  }

  /**
   * @returns number of audio samples per frame (i.e. the length of the array provided to the process function)
   * @see {@link process}
   */
  get frameLength() {
    return this._frameLength;
  }

  /**
   * @returns the audio sampling rate accepted by Picovoice
   */
  get sampleRate() {
    return this._sampleRate;
  }

  /**
   * @returns the version of the Picovoice SDK
   */
  get version() {
    return this._version;
  }

  /**
   * @returns the version of the Porcupine SDK
   */
  get porcupineVersion() {
    return this._porcupine?.version;
  }

  /**
   * @returns the version of the Rhino SDK
   */
  get rhinoVersion() {
    return this._rhino?.version;
  }

  /**
   * @returns the Rhino context source YAML
   */
  get contextInfo() {
    return this._rhino?.contextInfo;
  }

  /**
   * Release the resources acquired by Picovoice (via Porcupine and Rhino engines).
   */
  async delete() {
    if (this._porcupine !== null) {
      await this._porcupine.delete();
      this._porcupine = null;
    }
    if (this._rhino !== null) {
      await this._rhino.delete();
      this._rhino = null;
    }
  }
}

export { Picovoice, WakeWordCallback, InferenceCallback };
