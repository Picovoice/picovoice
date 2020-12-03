//
// Copyright 2020 Picovoice Inc.
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
type WakeWordCallback = (keywordIndex: number) => void;
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

      if (keywordIndex !== -1) {
        this._isWakeWordDetected = true;
        this._wakeWordCallback(keywordIndex);
      }
    } else {
      const result = await this._rhino.process(frame);
      if(result['isFinalized'] === true){
        this._isWakeWordDetected = false;

        // format result in native module did not maintain order
        let formattedInference;
        if (result['isUnderstood'] === true) {
          formattedInference = {
            isUnderstood: result['isUnderstood'],
            intent: result['intent'],
            slots: result['slots'],
          };
        } else {
          formattedInference = {
            isUnderstood: result['isUnderstood'],
          };
        }

        this._inferenceCallback(formattedInference);
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
