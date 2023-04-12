/*
  Copyright 2022-2023 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { PorcupineDetection } from '@picovoice/porcupine-web';

import { RhinoInference } from '@picovoice/rhino-web';

export type PicovoiceArgs = {
  keywordPath: string;
  keywordLabel: string;
  porcupineSensitivity: number;
  porcupineModelPath: string;
  contextPath: string;
  rhinoSensitivity: number;
  rhinoModelPath: string;
};

export type PicovoiceOptions = {
  processErrorCallback?: (error: Error) => void;
  /** @defaultValue '1.0' */
  endpointDurationSec?: number;
  /** @defaultValue 'false' */
  requireEndpoint?: boolean;
};

export type PicovoiceWorkerInitRequest = {
  command: 'init';
  accessKey: string;
  keywordPath: string;
  keywordLabel: string;
  porcupineSensitivity: number;
  porcupineModelPath: string;
  contextPath: string;
  rhinoSensitivity: number;
  rhinoModelPath: string;
  options: PicovoiceOptions;
};

export type PicovoiceWorkerProcessRequest = {
  command: 'process';
  inputFrame: Int16Array;
};

export type PicovoiceWorkerResetRequest = {
  command: 'reset';
};

export type PicovoiceWorkerReleaseRequest = {
  command: 'release';
};

export type PicovoiceWorkerRequest =
  | PicovoiceWorkerInitRequest
  | PicovoiceWorkerProcessRequest
  | PicovoiceWorkerResetRequest
  | PicovoiceWorkerReleaseRequest;

export type PicovoiceWorkerFailureResponse = {
  command: 'failed' | 'error';
  message: string;
};

export type PicovoiceWorkerInitResponse =
  | PicovoiceWorkerFailureResponse
  | {
      command: 'ok';
      frameLength: number;
      sampleRate: number;
      version: string;
      contextInfo: string;
    };

export type PicovoiceWorkerDetectionResponse = {
  command: 'detection';
  detection: PorcupineDetection;
};

export type PicovoiceWorkerInferenceResponse = {
  command: 'inference';
  inference: RhinoInference;
};

export type PicovoiceWorkerProcessResponse =
  | PicovoiceWorkerFailureResponse
  | PicovoiceWorkerDetectionResponse
  | PicovoiceWorkerInferenceResponse;

export type PicovoiceWorkerResetResponse =
  | PicovoiceWorkerFailureResponse
  | {
      command: 'ok';
    };

export type PicovoiceWorkerReleaseResponse =
  | PicovoiceWorkerFailureResponse
  | {
      command: 'ok';
    };

export type PicovoiceWorkerResponse =
  | PicovoiceWorkerInitResponse
  | PicovoiceWorkerProcessResponse
  | PicovoiceWorkerResetResponse
  | PicovoiceWorkerReleaseResponse;
