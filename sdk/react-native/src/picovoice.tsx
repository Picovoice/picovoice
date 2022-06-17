//
// Copyright 2020-2022 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import { Porcupine, PorcupineErrors } from '@picovoice/porcupine-react-native';
import {
  Rhino,
  RhinoErrors,
  RhinoInference,
} from '@picovoice/rhino-react-native';
import * as PicovoiceErrors from './picovoice_errors';

export type WakeWordCallback = () => void;
export type InferenceCallback = (inference: RhinoInference) => void;

class Picovoice {
  private _porcupine: Porcupine | null;
  private readonly _wakeWordCallback: WakeWordCallback;
  private _rhino: Rhino | null;
  private readonly _inferenceCallback: InferenceCallback;

  private readonly _frameLength: number;
  private readonly _sampleRate: number;
  private readonly _version: string;
  private _isWakeWordDetected = false;

  /**
   * Picovoice constructor
   *
   * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/).
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
   * @param rhinoSensitivity It should be a number within [0, 1]. A higher sensitivity value
   * results in fewer misses at the cost of(potentially) increasing the erroneous inference rate.
   * @param endpointDurationSec Endpoint duration in seconds. An endpoint is a chunk of silence at the end of an
   * utterance that marks the end of spoken command. It should be a positive number within [0.5, 5]. A lower endpoint
   * duration reduces delay and improves responsiveness. A higher endpoint duration assures Rhino doesn't return inference
   * pre-emptively in case the user pauses before finishing the request.
   * @param requireEndpoint If set to `true`, Rhino requires an endpoint (a chunk of silence) after the spoken command.
   * If set to `false`, Rhino tries to detect silence, but if it cannot, it still will provide inference regardless. Set
   * to `false` only if operating in an environment with overlapping speech (e.g. people talking in the background).
   * @returns an instance of the Picovoice end-to-end platform.
   */
  public static async create(
    accessKey: string,
    keywordPath: string,
    wakeWordCallback: WakeWordCallback,
    contextPath: string,
    inferenceCallback: InferenceCallback,
    porcupineSensitivity: number = 0.5,
    rhinoSensitivity: number = 0.5,
    porcupineModelPath?: string,
    rhinoModelPath?: string,
    endpointDurationSec: number = 1.0,
    requireEndpoint: boolean = true
  ) {
    try {
      let porcupine: Porcupine = await Porcupine.fromKeywordPaths(
        accessKey,
        [keywordPath],
        porcupineModelPath,
        [porcupineSensitivity]
      );
      let rhino: Rhino = await Rhino.create(
        accessKey,
        contextPath,
        rhinoModelPath,
        rhinoSensitivity,
        endpointDurationSec,
        requireEndpoint
      );

      if (
        wakeWordCallback === undefined ||
        wakeWordCallback === null ||
        typeof wakeWordCallback !== 'function'
      ) {
        throw new PicovoiceErrors.PicovoiceInvalidArgumentError(
          "'wakeWordCallback' must be set."
        );
      }

      if (
        inferenceCallback === undefined ||
        inferenceCallback === null ||
        typeof inferenceCallback !== 'function'
      ) {
        throw new PicovoiceErrors.PicovoiceInvalidArgumentError(
          "'inferenceCallback' must be set."
        );
      }

      if (porcupine.frameLength !== rhino.frameLength) {
        throw new PicovoiceErrors.PicovoiceInvalidArgumentError(
          `Porcupine frame length ${porcupine.frameLength} and Rhino frame length ${rhino.frameLength} are different.`
        );
      }

      if (porcupine.sampleRate !== rhino.sampleRate) {
        throw new PicovoiceErrors.PicovoiceInvalidArgumentError(
          `Porcupine sample rate ${porcupine.sampleRate} and Rhino sample rate ${rhino.sampleRate} are different.`
        );
      }

      return new Picovoice(
        porcupine,
        wakeWordCallback,
        rhino,
        inferenceCallback
      );
    } catch (e) {
      throw this.mapToPicovoiceError(e as Error);
    }
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
    this._version = '2.1.0';
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
      throw new PicovoiceErrors.PicovoiceInvalidStateError(
        'Cannot process frame - resources have been released.'
      );
    }

    if (frame === undefined || frame === null) {
      throw new PicovoiceErrors.PicovoiceInvalidArgumentError(
        'Passed null frame to Picovoice process.'
      );
    }

    if (frame.length !== this._frameLength) {
      throw new PicovoiceErrors.PicovoiceInvalidArgumentError(
        `Picovoice process requires frames of length ${this._frameLength}. Received frame of size ${frame.length}.`
      );
    }

    if (!this._isWakeWordDetected) {
      const keywordIndex = await this._porcupine.process(frame);

      if (keywordIndex >= 0) {
        this._isWakeWordDetected = true;
        this._wakeWordCallback();
      }
    } else {
      const result = await this._rhino.process(frame);
      if (result.isFinalized) {
        this._isWakeWordDetected = false;

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

  /**
   * Gets the exception type given a code.
   * @param e Error to covert to picovoice exception
   */
  private static mapToPicovoiceError(
    e: PorcupineErrors.PorcupineError | RhinoErrors.RhinoError
  ) {
    if (
      e instanceof PorcupineErrors.PorcupineActivationError ||
      e instanceof RhinoErrors.RhinoActivationError
    ) {
      return new PicovoiceErrors.PicovoiceActivationError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineActivationLimitError ||
      e instanceof RhinoErrors.RhinoActivationLimitError
    ) {
      return new PicovoiceErrors.PicovoiceActivationLimitError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineActivationRefusedError ||
      e instanceof RhinoErrors.RhinoActivationRefusedError
    ) {
      return new PicovoiceErrors.PicovoiceActivationRefusedError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineActivationThrottledError ||
      e instanceof RhinoErrors.RhinoActivationThrottledError
    ) {
      return new PicovoiceErrors.PicovoiceActivationThrottledError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineInvalidArgumentError ||
      e instanceof RhinoErrors.RhinoInvalidArgumentError
    ) {
      return new PicovoiceErrors.PicovoiceInvalidArgumentError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineInvalidStateError ||
      e instanceof RhinoErrors.RhinoInvalidStateError
    ) {
      return new PicovoiceErrors.PicovoiceInvalidStateError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineIOError ||
      e instanceof RhinoErrors.RhinoIOError
    ) {
      return new PicovoiceErrors.PicovoiceIOError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineKeyError ||
      e instanceof RhinoErrors.RhinoKeyError
    ) {
      return new PicovoiceErrors.PicovoiceKeyError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineMemoryError ||
      e instanceof RhinoErrors.RhinoMemoryError
    ) {
      return new PicovoiceErrors.PicovoiceMemoryError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineRuntimeError ||
      e instanceof RhinoErrors.RhinoRuntimeError
    ) {
      return new PicovoiceErrors.PicovoiceRuntimeError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineStopIterationError ||
      e instanceof RhinoErrors.RhinoStopIterationError
    ) {
      return new PicovoiceErrors.PicovoiceStopIterationError(e.message);
    } else if (
      e instanceof PorcupineErrors.PorcupineError ||
      e instanceof RhinoErrors.RhinoError
    ) {
      return new PicovoiceErrors.PicovoiceError(e.message);
    } else {
      return new PicovoiceErrors.PicovoiceError(e);
    }
  }
}

export { Picovoice };
