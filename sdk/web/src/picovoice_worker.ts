/*
  Copyright 2022-2023 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import PvWorker from 'web-worker:./picovoice_worker_handler.ts';

import {
  PicovoiceOptions,
  PicovoiceWorkerInitResponse,
  PicovoiceWorkerProcessResponse,
  PicovoiceWorkerReleaseResponse,
  PicovoiceWorkerResetResponse,
} from './types';

import {
  DetectionCallback,
  PorcupineKeyword,
  PorcupineModel,
} from '@picovoice/porcupine-web';

import {
  InferenceCallback,
  RhinoContext,
  RhinoModel,
} from '@picovoice/rhino-web';

import { loadPicovoiceArgs } from './utils';

export class PicovoiceWorker {
  private readonly _worker: Worker;
  private readonly _version: string;
  private readonly _frameLength: number;
  private readonly _sampleRate: number;
  private readonly _contextInfo: string;

  private constructor(
    worker: Worker,
    version: string,
    frameLength: number,
    sampleRate: number,
    contextInfo: string
  ) {
    this._worker = worker;
    this._version = version;
    this._frameLength = frameLength;
    this._sampleRate = sampleRate;
    this._contextInfo = contextInfo;
  }

  /**
   * Get Picovoice SDK version.
   */
  get version(): string {
    return this._version;
  }

  /**
   * Get number of samples per frame required by Picovoice.
   */
  get frameLength(): number {
    return this._frameLength;
  }

  /**
   * Get audio sample rate required by Picovoice.
   */
  get sampleRate(): number {
    return this._sampleRate;
  }

  /**
   * Get Rhino context info.
   */
  get contextInfo(): string {
    return this._contextInfo;
  }

  /**
   * Get Picovoice worker instance.
   */
  get worker(): Worker {
    return this._worker;
  }
  /**
   * Creates an instance of PicovoiceWorker.
   *
   * @param accessKey AccessKey obtained from Picovoice Console.
   * @param keyword A Porcupine keyword. Can be provided as a built-in, base64 or a hosted `ppn` file.
   * @param wakeWordCallback User-defined callback to run after a keyword is detected.
   * @param porcupineModel Contains the model parameters that are used to initialize the Porcupine engine.
   * Model can be encoded in base64 or can be stored in a `pv` file in a public directory.
   * @param context A Rhino context. Can be provided as a base64 or a hosted `rhn` file.
   * @param inferenceCallback User-defined callback invoked when Rhino has made an inference.
   * @param rhinoModel Contains the model parameters that are used to initialize the Rhino engine.
   * Model can be encoded in base64 or can be stored in a `pv` file in a public directory.
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
  ): Promise<PicovoiceWorker> {
    const { processErrorCallback, ...rest } = options;

    const worker = new PvWorker();
    const returnPromise: Promise<PicovoiceWorker> = new Promise(
      (resolve, reject) => {
        // @ts-ignore - block from GC
        this.worker = worker;
        worker.onmessage = (
          event: MessageEvent<PicovoiceWorkerInitResponse>
        ): void => {
          switch (event.data.command) {
            case 'ok':
              worker.onmessage = (
                ev: MessageEvent<
                  PicovoiceWorkerProcessResponse | PicovoiceWorkerResetResponse
                >
              ): void => {
                switch (ev.data.command) {
                  case 'ok':
                    break;
                  case 'detection':
                    wakeWordCallback(ev.data.detection);
                    break;
                  case 'inference':
                    inferenceCallback(ev.data.inference);
                    break;
                  case 'failed':
                  case 'error':
                    const error = new Error(ev.data.message);
                    if (processErrorCallback) {
                      processErrorCallback(error);
                    } else {
                      // eslint-disable-next-line no-console
                      console.error(error);
                    }
                    break;
                  default:
                    if (processErrorCallback) {
                      processErrorCallback(
                        new Error(`Unrecognized command: ${event.data.command}`)
                      );
                    } else {
                      // eslint-disable-next-line no-console
                      console.error(
                        `Unrecognized command: ${event.data.command}`
                      );
                    }
                }
              };
              resolve(
                new PicovoiceWorker(
                  worker,
                  event.data.version,
                  event.data.frameLength,
                  event.data.sampleRate,
                  event.data.contextInfo
                )
              );
              break;
            case 'failed':
            case 'error':
              reject(event.data.message);
              break;
            default:
              // @ts-ignore
              reject(`Unrecognized command: ${event.data.command}`);
          }
        };
      }
    );

    const picovoiceArgs = await loadPicovoiceArgs(
      keyword,
      porcupineModel,
      context,
      rhinoModel
    );

    worker.postMessage({
      command: 'init',
      accessKey: accessKey,
      options: rest,
      ...picovoiceArgs,
    });

    return returnPromise;
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
  public process(pcm: Int16Array): void {
    this._worker.postMessage({
      command: 'process',
      inputFrame: pcm,
    });
  }

  /**
   * Resets the internal Picovoice state.
   */
  public reset(): void {
    this._worker.postMessage({
      command: 'reset',
    });
  }

  /**
   * Releases resources acquired by Picovoice engines.
   */
  public release(): Promise<void> {
    const returnPromise: Promise<void> = new Promise((resolve, reject) => {
      this._worker.onmessage = (
        event: MessageEvent<PicovoiceWorkerReleaseResponse>
      ): void => {
        switch (event.data.command) {
          case 'ok':
            resolve();
            break;
          case 'failed':
          case 'error':
            reject(event.data.message);
            break;
          default:
            // @ts-ignore
            reject(`Unrecognized command: ${event.data.command}`);
        }
      };
    });

    this._worker.postMessage({
      command: 'release',
    });

    return returnPromise;
  }

  /**
   * Terminates the active worker. Stops all requests being handled by worker.
   */
  public terminate(): void {
    this._worker.terminate();
  }
}
