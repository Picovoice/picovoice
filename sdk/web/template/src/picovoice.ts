/*
  Copyright 2021-2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { Porcupine } from '@picovoice/porcupine-web-$lang$-factory';
import { Rhino } from '@picovoice/rhino-web-$lang$-factory';

export { Porcupine, Rhino };

import {
  PicovoiceEngine,
  PicovoiceEngineArgs,
} from '@picovoice/picovoice-web-core';

import { PorcupineKeyword, PorcupineEngine } from '@picovoice/porcupine-web-core';

import {
  RhinoEngine,
  RhinoInference,
} from '@picovoice/rhino-web-core';


type EngineControlType = 'ppn' | 'rhn';

export class Picovoice implements PicovoiceEngine {
  private _contextInfo: string;
  private _engineControl: EngineControlType = 'ppn';
  private _frameLength: number = 512;
  private _paused: boolean;
  private _porcupineCallback: (keyword: string) => void
  private _porcupineEngine: PorcupineEngine
  private _rhinoCallback: (inference: RhinoInference) => void
  private _rhinoEngine: RhinoEngine
  private _sampleRate: number = 16000;
  private _version: string = '2.1.0';

  private constructor(
    porcupineEngine: PorcupineEngine,
    rhinoEngine: RhinoEngine,
    porcupineCallback: (keyword: string) => void,
    rhinoCallback: (inference: RhinoInference) => void,
  ) {
    this._porcupineEngine = porcupineEngine;
    this._rhinoEngine = rhinoEngine;
    this._porcupineCallback = porcupineCallback;
    this._rhinoCallback = rhinoCallback;
    this._paused = false;
    this._engineControl = 'ppn';
    this._contextInfo = rhinoEngine.contextInfo;
  }

  /**
   * Creates an instance of Picovoice.
   *
   * Behind the scenes, it requires the WebAssembly code to load and initialize before
   * it can create an instance.
   *
   * @param picovoiceArgs the wake word and context for a continuous voice interaction loop
   * @param picovoiceArgs.porcupineKeyword the Pocupine wake word to activate an interaction loop
   * @param picovoiceArgs.rhinoContext the Rhino Speech-to-Intent context for the follow-on command
   *
   * @returns An instance of the Picovoice engine.
   */
  public static async create(
    picovoiceArgs: PicovoiceEngineArgs
  ): Promise<Picovoice> {
    const {
      accessKey,
      porcupineKeyword,
      porcupineCallback,
      rhinoContext,
      rhinoCallback,
      requireEndpoint,
    } = picovoiceArgs;

    // We need to assert PorcupineKeyword here because we don't know the language-specific keywords
    const porcupineEngine = await Porcupine.create(accessKey, porcupineKeyword as PorcupineKeyword);
    const rhinoEngine = await Rhino.create(accessKey, rhinoContext, requireEndpoint);

    if (
      typeof porcupineCallback !== 'function' ||
      typeof rhinoCallback !== 'function'
    ) {
      throw new Error(
        'Arguments porcupineCallback and rhinoCallback must be functions'
      );
    }

    return new Picovoice(
      porcupineEngine,
      rhinoEngine,
      porcupineCallback,
      rhinoCallback
    );
  }

  public async process(inputFrame: Int16Array): Promise<void> {
    if (!this._paused) {
      switch (this._engineControl) {
        case 'ppn': {
          const keywordIndex = await this._porcupineEngine.process(inputFrame);
          if (keywordIndex !== -1) {
            this._engineControl = 'rhn';
            this._porcupineCallback(
              this._porcupineEngine.keywordLabels.get(keywordIndex)
            );
          }
          break;
        }
        case 'rhn': {
          const inference = await this._rhinoEngine.process(inputFrame);
          if (inference.isFinalized) {
            this._engineControl = 'ppn';
            this._rhinoCallback(inference);
          }
          break;
        }
        default:
          // eslint-disable-next-line no-console
          console.warn('Unexpected engineControl state: ' + this._engineControl as any);
          break;
      }
    }
  }

  public release(): void {
    if (this._porcupineEngine !== null) {
      this._porcupineEngine.release();
    }
    this._porcupineEngine = null;

    if (this._rhinoEngine !== null) {
      this._rhinoEngine.release();
    }
    this._rhinoEngine = null;
  }

  public reset(): void {
    this._engineControl = 'ppn'
  }

  get version(): string {
    return this._version;
  }

  get frameLength(): number {
    return this._frameLength;
  }

  get sampleRate(): number {
    return this._sampleRate;
  }

  set paused(pause: boolean) {
    this._paused = pause;
  }

  get paused(): boolean {
    return this._paused;
  }

  get contextInfo(): string {
    return this._contextInfo;
  }
}
