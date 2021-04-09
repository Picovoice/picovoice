//
// Rhino Types
//
export type RhinoInference = {
  isFinalized: boolean;
  isUnderstood?: boolean;
  intent?: string;
  slots?: Record<string, unknown>;
};

export type RhinoWorkerResponseInference = {
  command: 'rhn-inference';
  inference: RhinoInference;
};

export interface RhinoEngine {
  /** Release all resources acquired by Rhino */
  release(): void;
  /** Process a single frame of 16-bit 16kHz PCM audio */
  process(frame: Int16Array): RhinoInference;
  /** The version of the Rhino engine */
  readonly version: string;
  /** The sampling rate of audio expected by the Rhino engine */
  readonly sampleRate: number;
  /** The frame length of audio expected by the Rhino engine */
  readonly frameLength: number;
  /** The source of the Rhino context (YAML format) */
  readonly contextInfo: string;
}

export type RhinoContext = {
  base64: string;
  sensitivty?: number;
};

export type RhinoWorkerRequestInfo = {
  command: 'info'
}

export type RhinoWorkerResponseInfo = {
  command: 'rhn-info';
  info: string
};

//
// Porcupine Types
//
export type PorcupineKeywordCustom = {
  base64: string;
  custom: string;
  sensitivity?: number;
};

export type PorcupineKeywordBuiltin = {
  builtin: string; // Actually a restricted set of strings, per language
  sensitivity?: number;
};

export type PorcupineKeyword = PorcupineKeywordCustom | PorcupineKeywordBuiltin;

export type PorcupineWorkerResponseKeyword = {
  command: 'ppn-keyword';
  keywordLabel: string;
};

export interface PorcupineEngine {
  version: string;
  sampleRate: number;
  frameLength: number;
  keywordLabels: Map<number, string>;
  release(): void;
  process(frames: Int16Array): number;
}


//
// Picovoice Types
//
export type PicovoiceWorkerArgs = {
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  start?: boolean;
};

export type PicovoiceEngineArgs = {
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  porcupineCallback: (keywordLabel: string) => void;
  rhinoCallback: (inference: RhinoInference) => void;
};

export interface PicovoiceEngine {
  version: string;
  sampleRate: number;
  frameLength: number;
  release(): void;
  process(frames: Int16Array): void;
}

export type WorkerRequestProcess = {
  command: 'process';
  inputFrame: Int16Array;
};

export type WorkerRequestVoid = {
  command: 'reset' | 'pause' | 'resume' | 'release';
};

export type PicovoiceWorkerResponseErrorInit = {
  command: 'pv-error-init';
  error: Error | string;
};

export type PicovoiceWorkerRequestInit = {
  command: 'init';
  picovoiceArgs: PicovoiceWorkerArgs;
};

export type PicovoiceWorkerResponseReady = {
  command: 'pv-ready';
};

export type PicovoiceWorkerRequest =
  | PicovoiceWorkerRequestInit
  | WorkerRequestVoid
  | RhinoWorkerRequestInfo;
export type PicovoiceWorkerResponse =
  | PicovoiceWorkerResponseErrorInit
  | PicovoiceWorkerResponseReady
  | PorcupineWorkerResponseKeyword
  | RhinoWorkerResponseInference
  | RhinoWorkerResponseInfo;

export interface PicovoiceWorker extends Omit<Worker, 'postMessage'> {
  postMessage(command: PicovoiceWorkerRequest): void;
}

export interface PicovoiceWorkerFactory {
  create: (
    picovoiceWorkerArgs: PicovoiceWorkerArgs
  ) => Promise<PicovoiceWorker>;
}

export type PicovoiceServiceArgs = {
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  start?: boolean;
};
