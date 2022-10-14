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

import { loadPicovoiceArgs } from './utils';

export class Picovoice {
  private _porcupine: Porcupine | null = null;
  private _rhino: Rhino | null = null;
  private _isWakeWordDetected: boolean = false;

  private readonly _version: string = '2.1.0';

  /**
   * Get Picovoice SDK version.
   */
  get version(): string {
    return this._version;
  }

  /**
   * Get number of samples per frame required by Picovoice.
   */
  get frameLength(): number | undefined {
    return this._porcupine?.frameLength;
  }

  /**
   * Get audio sample rate required by Picovoice.
   */
  get sampleRate(): number | undefined {
    return this._porcupine?.sampleRate;
  }

  /**
   * Get Rhino context info.
   */
  get contextInfo(): string | undefined {
    return this._rhino?.contextInfo;
  }

  /**
   * Creates an instance of Picovoice.
   *
   * @param accessKey AccessKey obtained from Picovoice Console.
   * @param keyword A Porcupine keyword. Can be provided as a built-in, base64 or a hosted `.ppn` file.
   * @param wakeWordCallback User-defined callback to run after a keyword is detected.
   * @param porcupineModel Contains the model parameters that are used to initialize the Porcupine engine.
   * Model can be encoded in base64 or can be stored in a `.pv` file in a public directory.
   * @param context A Rhino context. Can be provided as a base64 or a hosted `.rhn` file.
   * @param inferenceCallback User-defined callback invoked when Rhino has made an inference.
   * @param rhinoModel Contains the model parameters that are used to initialize the Rhino engine.
   * Model can be encoded in base64 or can be stored in a `.pv` file in a public directory.
   * @param options Optional configuration arguments.
   * @param options.endpointDurationSec Endpoint duration in seconds.
   * An endpoint is a chunk of silence at the end of an utterance that marks
   * the end of spoken command. It should be a positive number within [0.5, 5].
   * A lower endpoint duration reduces delay and improves responsiveness. A higher endpoint duration
   * assures Rhino doesn't return inference pre-emptively in case the user pauses before finishing the request.
   * @param options.requireEndpoint If set to `true`, Rhino requires an endpoint (a chunk of silence)
   * after the spoken command. If set to `false`, Rhino tries to detect silence, but if it cannot,
   * it still will provide inference regardless. Set to `false` only if operating in an
   * environment with overlapping speech (e.g. people talking in the background).
   * @param options.processErrorCallback User-defined callback invoked if any error happens
   * while processing the audio stream. Its only input argument is the error message.
   *
   * @returns An instance of the Picovoice platform.
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
    const {
      keywordPath,
      keywordLabel,
      porcupineSensitivity,
      porcupineModelPath,
      contextPath,
      rhinoSensitivity,
      rhinoModelPath,
    } = await loadPicovoiceArgs(keyword, porcupineModel, context, rhinoModel);

    return this._init(
      accessKey,
      keywordPath,
      keywordLabel,
      porcupineSensitivity,
      wakeWordCallback,
      porcupineModelPath,
      contextPath,
      rhinoSensitivity,
      inferenceCallback,
      rhinoModelPath,
      options
    );
  }

  public static async _init(
    accessKey: string,
    keywordPath: string,
    keywordLabel: string,
    porcupineSensitivity: number,
    wakeWordCallback: DetectionCallback,
    porcupineModelPath: string,
    contextPath: string,
    rhinoSensitivity: number,
    inferenceCallback: InferenceCallback,
    rhinoModelPath: string,
    options: PicovoiceOptions = {}
  ): Promise<Picovoice> {
    const { processErrorCallback, endpointDurationSec, requireEndpoint } =
      options;

    const picovoice = new Picovoice();

    const porcupineCallback = (detection: PorcupineDetection): void => {
      picovoice._isWakeWordDetected = true;
      wakeWordCallback(detection);
    };
    picovoice._porcupine = await Porcupine._init(
      accessKey,
      [keywordPath],
      [keywordLabel],
      porcupineCallback,
      new Float32Array([porcupineSensitivity]),
      porcupineModelPath,
      { processErrorCallback }
    );

    const rhinoCallback = (inference: RhinoInference): void => {
      if (inference.isFinalized) {
        picovoice._isWakeWordDetected = false;
        inferenceCallback(inference);
      }
    };
    picovoice._rhino = await Rhino._init(
      accessKey,
      contextPath,
      rhinoSensitivity,
      rhinoCallback,
      rhinoModelPath,
      { processErrorCallback, endpointDurationSec, requireEndpoint }
    );

    return picovoice;
  }

  /**
   * Processes a frame of audio. The required sample rate can be retrieved from '.sampleRate' and the length
   * of frame (number of audio samples per frame) can be retrieved from '.frameLength' The audio needs to be
   * 16-bit linearly-encoded. Furthermore, the engine operates on single-channel audio.
   *
   * Results are returned via the user-defined `wakeWordCallback` and `inferenceCallback`.
   *
   * @param pcm A frame of audio with properties described above.
   */
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

  /**
   * Resets the internal Picovoice state.
   */
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

  /**
   * Releases resources acquired by Picovoice engines.
   */
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

  async onmessage(e: MessageEvent): Promise<void> {
    switch (e.data.command) {
      case 'process':
        await this.process(e.data.inputFrame);
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unrecognized command: ${e.data.command}`);
    }
  }
}
