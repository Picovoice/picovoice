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
'use strict';

import { Porcupine } from '@picovoice/porcupine-node';
import { Rhino, RhinoInference } from '@picovoice/rhino-node';

import {
  PicovoiceInvalidArgumentError,
  PicovoiceInvalidStateError,
} from './errors';

export type WakeWordCallback = (keyword: number) => void;
export type InferenceCallback = (inference: RhinoInference) => void;

/**
 * Wraps the Picovoice Porcupine and Rhino engines.
 *
 * Switches input from Porcupine to Rhino upon wake word detection, then back to Rhino upon inference conclusion.
 * Fires callbacks on wake word and inference events.
 */
export default class Picovoice {
  private porcupine: Porcupine | null;
  private rhino: Rhino | null;

  private readonly wakeWordCallback: WakeWordCallback;
  private readonly inferenceCallback: InferenceCallback;

  private readonly _frameLength: number;
  private readonly _sampleRate: number;
  private readonly _version: string;
  private readonly _porcupineVersion: string;
  private readonly _rhinoVersion: string;
  private readonly _contextInfo: string;

  private isWakeWordDetected: boolean;

  /**
   * Creates an instance of Picovoice with a specific keyword and context.
   * @param {string} accessKey Obtained from the Picovoice Console (https://console.picovoice.ai/)
   * @param {string} keywordPath,
   * @param {function} wakeWordCallBack,
   * @param {string} contextPath,
   * @param {function} inferenceCallback,
   * @param {number} porcupineSensitivity = 0.5,
   * @param {number} rhinoSensitivity = 0.5,
   * @param {number} endpointDurationSec = 1.0,
   * @param {boolean} requireEndpoint = true,
   * @param {string} porcupineModelPath,
   * @param {string} rhinoModelPath,
   * @param {string} porcupineLibraryPath,
   * @param {string} rhinoLibraryPath,
   */
  constructor(
    accessKey: string,
    keywordPath: string,
    wakeWordCallback: WakeWordCallback,
    contextPath: string,
    inferenceCallback: InferenceCallback,
    porcupineSensitivity: number = 0.5,
    rhinoSensitivity: number = 0.5,
    endpointDurationSec: number = 1.0,
    requireEndpoint: boolean = true,
    porcupineModelPath?: string,
    rhinoModelPath?: string,
    porcupineLibraryPath?: string,
    rhinoLibraryPath?: string
  ) {
    if (
      accessKey === null ||
      accessKey === undefined ||
      accessKey.length === 0
    ) {
      throw new PicovoiceInvalidArgumentError(
        `No AccessKey provided to Picovoice`
      );
    }

    if (!(wakeWordCallback instanceof Function)) {
      throw new PicovoiceInvalidArgumentError(
        "Parameter 'wakeWordCallback' is not a function"
      );
    }

    this.wakeWordCallback = wakeWordCallback;

    if (!(inferenceCallback instanceof Function)) {
      throw new PicovoiceInvalidArgumentError(
        "Parameter 'inferenceCallback' is not a function"
      );
    }

    this.inferenceCallback = inferenceCallback;

    this.porcupine = new Porcupine(
      accessKey,
      [keywordPath],
      [porcupineSensitivity],
      porcupineModelPath,
      porcupineLibraryPath
    );

    this.rhino = new Rhino(
      accessKey,
      contextPath,
      rhinoSensitivity,
      endpointDurationSec,
      requireEndpoint,
      rhinoModelPath,
      rhinoLibraryPath
    );

    this._frameLength = 512;
    this._sampleRate = 16000;
    this._version = '2.2.0';

    this._porcupineVersion = this.porcupine.version;
    this._rhinoVersion = this.rhino.version;
    this._contextInfo = this.rhino.getContextInfo();

    this.isWakeWordDetected = false;
  }

  /**
   * @returns number of audio samples per frame (i.e. the length of the array provided to the process function)
   * @see {@link process}
   */
  get frameLength(): number {
    return this._frameLength;
  }

  /**
   * @returns the audio sampling rate accepted by Picovoice
   */
  get sampleRate(): number {
    return this._sampleRate;
  }

  /**
   * @returns the version of the Picovoice SDK
   */
  get version(): string {
    return this._version;
  }

  /**
   * @returns the version of the Porcupine SDK
   */
  get porcupineVersion(): string {
    return this._porcupineVersion;
  }

  /**
   * @returns the version of the Rhino SDK
   */
  get rhinoVersion(): string {
    return this._rhinoVersion;
  }

  /**
   * @returns the Rhino context source YAML
   */
  get contextInfo(): string {
    return this._contextInfo;
  }

  /**
   * Process a frame of pcm audio.
   *
   * @param {Array} frame 16-bit integers of 16kHz linear PCM mono audio.
   * The specific array length is obtained from Rhino via the frameLength field.
   */
  process(frame: Int16Array): void {
    if (this.porcupine === null || this.rhino === null) {
      throw new PicovoiceInvalidStateError(
        'Attempting to process but resources have been released.'
      );
    }
    if (!this.isWakeWordDetected) {
      const keywordIndex = this.porcupine.process(frame);

      if (keywordIndex !== -1) {
        this.isWakeWordDetected = true;
        this.wakeWordCallback(keywordIndex);
      }
    } else {
      const isFinalized = this.rhino.process(frame);

      if (isFinalized) {
        this.isWakeWordDetected = false;
        this.inferenceCallback(this.rhino.getInference());
      }
    }
  }

  /**
   * Release the resources acquired by Picovoice (via Porcupine and Rhino engines).
   */
  release(): void {
    if (this.porcupine !== null) {
      this.porcupine.release();
      this.porcupine = null;
    }
    if (this.rhino !== null) {
      this.rhino.release();
      this.rhino = null;
    }
  }
}
