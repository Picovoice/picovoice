/*
  Copyright 2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { PicovoiceOptions } from './types';

import {
  DetectionCallback,
  Porcupine,
  PorcupineDetection,
  PorcupineKeyword,
  PorcupineModel,
} from '@picovoice/porcupine-web';

import {
  InferenceCallback,
  Rhino,
  RhinoContext,
  RhinoInference,
  RhinoModel,
} from '@picovoice/rhino-web';

export class Picovoice {
  private _porcupine: Porcupine | null = null;
  private _rhino: Rhino | null = null;
  private _isWakeWordDetected: boolean = false;

  private readonly _version: string = '2.1.0';

  /**
   * Creates an instance of Picovoice.
   *
   * @param accessKey AccessKey obtained from Picovoice Console.
   * @param keyword - A built-in or base64
   * representation of a Porcupine keyword.
   * @param wakeWordCallback User-defined callback to run after a keyword is detected.
   * @param porcupineModel
   * @param context RhinoContext object containing a base64 representation
   * or a path to a public Rhino context file.
   * @param inferenceCallback User-defined callback invoked when Rhino has made an inference.
   * @param rhinoModel
   * @param options
   *
   * @returns An instance of the Picovoice engine.
   */
  public static async create(
    accessKey: string,
    keyword: PorcupineKeyword,
    wakeWordCallback: DetectionCallback,
    porcupineModel: PorcupineModel,
    context: RhinoContext,
    inferenceCallback: InferenceCallback,
    rhinoModel: RhinoModel,
    options: PicovoiceOptions = {}
  ): Promise<Picovoice> {
    const { processErrorCallback, endpointDurationSec, requireEndpoint } =
      options;

    const picovoice = new Picovoice();

    const porcupineCallback = (detection: PorcupineDetection): void => {
      picovoice._isWakeWordDetected = true;
      wakeWordCallback(detection);
    };
    picovoice._porcupine = await Porcupine.create(
      accessKey,
      keyword,
      porcupineCallback,
      porcupineModel,
      { processErrorCallback }
    );

    const rhinoCallback = (inference: RhinoInference): void => {
      picovoice._isWakeWordDetected = false;
      inferenceCallback(inference);
    };
    picovoice._rhino = await Rhino.create(
      accessKey,
      context,
      rhinoCallback,
      rhinoModel,
      { processErrorCallback, endpointDurationSec, requireEndpoint }
    );

    return picovoice;
  }

  public async process(pcm: Int16Array): Promise<void> {
    if (this._porcupine === null || this._rhino === null) {
      throw Error(
        'Picovoice has been released. You cannot call process after release.'
      );
    }

    if (!this._isWakeWordDetected) {
      await this._porcupine.process(pcm);
    } else {
      await this._rhino.process(pcm);
    }
  }

  public async reset(): Promise<void> {
    if (this._porcupine === null || this._rhino === null) {
      throw Error(
        'Picovoice has been released. You cannot call reset after release.'
      );
    }

    if (this._isWakeWordDetected) {
      this._isWakeWordDetected = false;
      await this._rhino.reset();
    }
  }

  public async release(): Promise<void> {
    if (this._porcupine !== null) {
      await this._porcupine.release();
    }
    this._porcupine = null;

    if (this._rhino !== null) {
      await this._rhino.release();
    }
    this._rhino = null;
  }

  get version(): string {
    return this._version;
  }

  get frameLength(): number | undefined {
    return this._porcupine?.frameLength;
  }

  get sampleRate(): number | undefined {
    return this._porcupine?.sampleRate;
  }

  get contextInfo(): string | undefined {
    return this._rhino?.contextInfo;
  }
}
