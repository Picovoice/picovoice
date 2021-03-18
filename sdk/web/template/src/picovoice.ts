/*
    Copyright 2021 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
    file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
    an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
    specific language governing permissions and limitations under the License.
*/

import { Porcupine } from '@picovoice/porcupine-web-$lang$-factory';
import { Rhino } from '@picovoice/rhino-web-$lang$-factory';
import { PorcupineKeyword } from '@picovoice/porcupine-web-$lang$-factory/dist/types/porcupine_types';

import {
  PorcupineEngine,
  RhinoEngine,
  RhinoInference,
  PicovoiceEngine,
  PicovoiceEngineArgs,
} from './picovoice_types';

type EngineControlType = 'ppn' | 'rhn'

export class Picovoice implements PicovoiceEngine {
  private _engineControl: EngineControlType = 'ppn'
  private _frameLength: number = 512
  private _paused: boolean
  private _sampleRate: number = 16000
  private _version: string = "1.0.0"

  private constructor(
    private _porcupineEngine: PorcupineEngine,
    private _rhinoEngine: RhinoEngine,
    private _porcupineCallback: (keyword: string) => void,
    private _rhinoCallback: (inference: RhinoInference) => void
  ) {
    this._paused = false;
    this._engineControl = 'ppn'
  }

  public static async create(picovoiceArgs: PicovoiceEngineArgs): Promise<Picovoice> {
    const { porcupineKeyword, porcupineCallback, rhinoContext, rhinoCallback } = picovoiceArgs

    // We need to assert PorcupineKeyword here because we don't know the language-specific keywords
    const porcupineEngine = await Porcupine.create(porcupineKeyword as PorcupineKeyword)
    const rhinoEngine = await Rhino.create(rhinoContext);

    if (typeof porcupineCallback !== "function" || typeof rhinoCallback !== "function") {
      throw new Error("Arguments porcupineCallback and rhinoCallback must be functions")
    }

    return new Picovoice(porcupineEngine, rhinoEngine, porcupineCallback, rhinoCallback)
  }

  public process(inputFrame: Int16Array): void {
    if (!this._paused) {
      switch (this._engineControl) {
        case 'ppn': {
          const keywordIndex = this._porcupineEngine.process(inputFrame);
          if (keywordIndex !== -1) {
            this._engineControl = 'rhn'
            this._porcupineCallback(this._porcupineEngine.keywordLabels.get(keywordIndex))
          }
          break;
        }
        case 'rhn': {
          const inference = this._rhinoEngine.process(inputFrame);
          if (inference.isFinalized) {
            this._engineControl = 'ppn'
            this._rhinoCallback(inference)
          }
          break;
        }
      }
    }
  }

  public release(): void {
    if (this._porcupineEngine !== null) {
      this._porcupineEngine.release();
    }
    this._porcupineEngine = null

    if (this._rhinoEngine !== null) {
      this._rhinoEngine.release();
    }
    this._rhinoEngine = null;
  }

  get version() {
    return this._version
  }

  get frameLength() {
    return this._frameLength
  }

  get sampleRate() {
    return this._sampleRate
  }

  set paused(pause: boolean) {
    this._paused = pause
  }

  get paused() {
    return this._paused
  }
}
