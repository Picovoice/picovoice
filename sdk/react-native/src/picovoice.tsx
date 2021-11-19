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

import { Porcupine, PorcupineExceptions } from '@picovoice/porcupine-react-native';
import { Rhino, RhinoExceptions, RhinoInference } from '@picovoice/rhino-react-native';
import * as PicovoiceExceptions from './picovoice_exceptions';

type WakeWordCallback = () => void;
type InferenceCallback = (inference: RhinoInference) => void;

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
   * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/.
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
   * @param requireEndpoint If true, Rhino requires an endpoint (chunk of silence) before finishing inference.
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
        requireEndpoint
      );
  
      if (wakeWordCallback === undefined || 
          wakeWordCallback === null ||
          typeof(wakeWordCallback) !== 'function') {
          throw new PicovoiceExceptions.PicovoiceInvalidArgumentException("'wakeWordCallback' must be set.");
      }
  
      if (inferenceCallback === undefined || 
          inferenceCallback === null ||
          typeof(inferenceCallback) !== 'function') {
          throw new PicovoiceExceptions.PicovoiceInvalidArgumentException("'inferenceCallback' must be set.");
      }
  
      if (porcupine.frameLength !== rhino.frameLength) {
        throw new PicovoiceExceptions.PicovoiceInvalidArgumentException(
          `Porcupine frame length ${porcupine.frameLength} and Rhino frame length ${rhino.frameLength} are different.`);
      }
  
      if (porcupine.sampleRate !== rhino.sampleRate) {
        throw new PicovoiceExceptions.PicovoiceInvalidArgumentException(
          `Porcupine sample rate ${porcupine.sampleRate} and Rhino sample rate ${rhino.sampleRate} are different.`);
      }
  
      return new Picovoice(porcupine, wakeWordCallback, rhino, inferenceCallback);
    } catch (e) {
      throw this.mapToPicovoiceException(e as Error);
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
    this._version = '2.0.0';
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
      throw new PicovoiceExceptions.PicovoiceInvalidStateException('Cannot process frame - resources have been released.');
    }

    if (frame === undefined || frame === null) {
      throw new PicovoiceExceptions.PicovoiceInvalidArgumentException('Passed null frame to Picovoice process.');
    }

    if (frame.length !== this._frameLength) {
      throw new PicovoiceExceptions.PicovoiceInvalidArgumentException(
        `Picovoice process requires frames of length ${this._frameLength}. Received frame of size ${frame.length}.`);
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
   private static mapToPicovoiceException(e: PorcupineExceptions.PorcupineException | RhinoExceptions.RhinoException) {
    if (e instanceof PorcupineExceptions.PorcupineActivationException || e instanceof RhinoExceptions.RhinoActivationException) {
        return new PicovoiceExceptions.PicovoiceActivationException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineActivationLimitException || e instanceof RhinoExceptions.RhinoActivationLimitException) {
        return new PicovoiceExceptions.PicovoiceActivationLimitException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineActivationRefusedException || e instanceof RhinoExceptions.RhinoActivationRefusedException) {
        return new PicovoiceExceptions.PicovoiceActivationRefusedException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineActivationThrottledException || e instanceof RhinoExceptions.RhinoActivationThrottledException) {
        return new PicovoiceExceptions.PicovoiceActivationThrottledException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineInvalidArgumentException || e instanceof RhinoExceptions.RhinoInvalidArgumentException) {
        return new PicovoiceExceptions.PicovoiceInvalidArgumentException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineInvalidStateException || e instanceof RhinoExceptions.RhinoInvalidStateException) {
        return new PicovoiceExceptions.PicovoiceInvalidStateException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineIOException || e instanceof RhinoExceptions.RhinoIOException) {
        return new PicovoiceExceptions.PicovoiceIOException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineKeyException || e instanceof RhinoExceptions.RhinoKeyException) {
        return new PicovoiceExceptions.PicovoiceKeyException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineMemoryException || e instanceof RhinoExceptions.RhinoMemoryException) {
        return new PicovoiceExceptions.PicovoiceMemoryException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineRuntimeException || e instanceof RhinoExceptions.RhinoRuntimeException) {
        return new PicovoiceExceptions.PicovoiceRuntimeException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineStopIterationException || e instanceof RhinoExceptions.RhinoStopIterationException) {
        return new PicovoiceExceptions.PicovoiceStopIterationException(e.message);
    } else if (e instanceof PorcupineExceptions.PorcupineException || e instanceof RhinoExceptions.RhinoException) {
        return new PicovoiceExceptions.PicovoiceException(e.message);
    } else {
        return new PicovoiceExceptions.PicovoiceException(e);
    }
  }
}

export { Picovoice, WakeWordCallback, InferenceCallback };
