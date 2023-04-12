/*
  Copyright 2022-2023 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

/// <reference no-default-lib="false"/>
/// <reference lib="webworker" />

import { PorcupineDetection } from '@picovoice/porcupine-web';
import { RhinoInference } from '@picovoice/rhino-web';

import { Picovoice } from './picovoice';
import { PicovoiceWorkerRequest } from './types';

function wakeWordCallback(detection: PorcupineDetection): void {
  self.postMessage({
    command: 'detection',
    detection: detection,
  });
}

function inferenceCallback(inference: RhinoInference): void {
  self.postMessage({
    command: 'inference',
    inference: inference,
  });
}

function processErrorCallback(error: Error): void {
  self.postMessage({
    command: 'error',
    message: error.message,
  });
}

/**
 * Picovoice worker handler.
 */
let picovoice: Picovoice | null = null;
self.onmessage = async function (
  event: MessageEvent<PicovoiceWorkerRequest>
): Promise<void> {
  switch (event.data.command) {
    case 'init':
      if (picovoice !== null) {
        self.postMessage({
          command: 'error',
          message: 'Picovoice has already been initialized',
        });
        return;
      }
      try {
        picovoice = await Picovoice._init(
          event.data.accessKey,
          event.data.keywordPath,
          event.data.keywordLabel,
          event.data.porcupineSensitivity,
          wakeWordCallback,
          event.data.porcupineModelPath,
          event.data.contextPath,
          event.data.rhinoSensitivity,
          inferenceCallback,
          event.data.rhinoModelPath,
          { ...event.data.options, processErrorCallback }
        );
        self.postMessage({
          command: 'ok',
          version: picovoice.version,
          frameLength: picovoice.frameLength,
          sampleRate: picovoice.sampleRate,
          contextInfo: picovoice.contextInfo,
        });
      } catch (e: any) {
        self.postMessage({
          command: 'error',
          message: e.message,
        });
      }
      break;
    case 'process':
      if (picovoice === null) {
        self.postMessage({
          command: 'error',
          message: 'Picovoice has not been initialized or has been released',
        });
        return;
      }
      await picovoice.process(event.data.inputFrame);
      break;
    case 'reset':
      if (picovoice === null) {
        self.postMessage({
          command: 'error',
          message: 'Picovoice has not been initialized or has been released',
        });
        return;
      }
      await picovoice.reset();
      self.postMessage({
        command: 'ok',
      });
      break;
    case 'release':
      if (picovoice !== null) {
        await picovoice.release();
        picovoice = null;
        close();
      }
      self.postMessage({
        command: 'ok',
      });
      break;
    default:
      self.postMessage({
        command: 'failed',
        // @ts-ignore
        message: `Unrecognized command: ${event.data.command}`,
      });
  }
};
