/*
  Copyright 2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { 
  PorcupineKeyword,
  PorcupineWorkerResponseKeyword
} from "@picovoice/porcupine-web-core";

import { 
  RhinoContext,
  RhinoInference,
  RhinoWorkerResponseInference,
  RhinoWorkerResponseInfo
} from "@picovoice/rhino-web-core";

export type PicovoiceWorkerArgs = {
  accessKey: string
  porcupineKeyword: PorcupineKeyword
  rhinoContext: RhinoContext
  endpointDurationSec?: number
  requireEndpoint?: boolean
  start?: boolean
}

export type PicovoiceEngineArgs = {
  accessKey: string
  porcupineKeyword: PorcupineKeyword
  rhinoContext: RhinoContext
  porcupineCallback: (keywordLabel: string) => void
  rhinoCallback: (inference: RhinoInference) => void
  endpointDurationSec?: number
  requireEndpoint?: boolean
}

export interface PicovoiceEngine {
  /** Release all resources acquired by Rhino */
  release(): void;
  /** Process a single frame of 16-bit 16kHz PCM audio */
  process(frame: Int16Array): Promise<void>;
  /** The version of the Rhino engine */
  readonly version: string;
  /** The sampling rate of audio expected by the Rhino engine */
  readonly sampleRate: number;
  /** The frame length of audio expected by the Rhino engine */
  readonly frameLength: number;
  /** The source of the Rhino context (YAML format) */
  readonly contextInfo: string;
}

export type WorkerRequestProcess = {
  command: 'process';
  inputFrame: Int16Array;
};

export type WorkerRequestVoid = {
  command: 'reset' | 'pause' | 'resume' | 'release';
};

export type PicovoiceWorkerResponseErrorInit = {
  command: 'pv-error-init'
  error: Error | string
}

export type PicovoiceWorkerRequestInit = {
  command: 'init'
  picovoiceArgs: PicovoiceWorkerArgs
}

export type PicovoiceWorkerRequestInfo = {
  command: 'info'
}

export type PicovoiceWorkerResponseReady = {
  command: 'pv-ready'
}

export type PicovoiceWorkerRequest =
  | PicovoiceWorkerRequestInit
  | WorkerRequestVoid
  | PicovoiceWorkerRequestInfo
  | WorkerRequestProcess;

export type PicovoiceWorkerResponse =
  | PicovoiceWorkerResponseErrorInit
  | PicovoiceWorkerResponseReady
  | PorcupineWorkerResponseKeyword
  | RhinoWorkerResponseInference
  | RhinoWorkerResponseInfo;

export interface PicovoiceWorker extends Omit<Worker, 'postMessage'> {
  postMessage(command: PicovoiceWorkerRequest): void
}

export interface PicovoiceWorkerFactory {
  create: (
    picovoiceWorkerArgs: PicovoiceWorkerArgs
  ) => Promise<PicovoiceWorker>;
}
