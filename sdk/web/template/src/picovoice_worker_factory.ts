/*
  Copyright 2018-2021 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import Worker from 'web-worker:./picovoice_worker.ts';
import {
  PicovoiceWorkerArgs,
  PicovoiceWorker,
  PicovoiceWorkerRequestInit,
  PicovoiceWorkerResponse,
} from './picovoice_types';

export default class PicovoiceWorkerFactory {
  private constructor() {}

  /**
   * Create Picovoice web worker instances. The promise resolves when the worker is ready to process
   * voice data (perhaps from WebVoiceProcessor).
   *
   * @param picovoiceArgs - A Porcupine keyword (builtin or custom, represented as a Base64 string), and
   * a Rhino context (Base64 string representations).
   * Also whether to start processing audio immediately upon instantiation, or to start paused.
   *
   */
  public static async create(
    picovoiceArgs: PicovoiceWorkerArgs
  ): Promise<PicovoiceWorker> {
    // n.b. The *Worker* creation is itself synchronous. But, inside the worker is an async
    // method of PicovoiceWorker which is initializing. This means the worker is not actually ready
    // for voice processing immediately after intantiation. When its initialization completes,
    // we receive a 'pv-ready' message and resolve the promise with the Worker.
    const picovoiceWorker = new Worker() as PicovoiceWorker;

    const pvInitCommand: PicovoiceWorkerRequestInit = {
      command: 'init',
      picovoiceArgs,
    };
    picovoiceWorker.postMessage(pvInitCommand);

    const workerPromise = new Promise<PicovoiceWorker>((resolve, reject) => {
      picovoiceWorker.onmessage = function (
        event: MessageEvent<PicovoiceWorkerResponse>
      ): void {
        switch (event.data.command) {
          case 'pv-ready': {
            // The Picovoice worker is fully initialized and ready to receive audio frames
            resolve(picovoiceWorker);
            break;
          }
          case 'ppn-keyword': {
            // The default Porcupine keyword detection event logs to console
            // Rhino will now be listening
            // eslint-disable-next-line no-console
            console.log(event.data.keywordLabel);
            break;
          }
          case 'rhn-inference': {
            // The default Rhino inference event event logs to console
            // Control will return to Porcupine
            // eslint-disable-next-line no-console
            console.log(event.data.inference);
            break;
          }
          case 'pv-error-init': {
            // The Picovoice worker initialization failed
            reject(event.data.error);
            break;
          }
          default: {
            // eslint-disable-next-line no-console
            console.warn('Unhandled resonse from PicovoiceWorker: ' + event.data.command);
            return;
          }
        }
      };
    });

    return workerPromise;
  }
}
