//
// Rhino Types
//
export type RhinoInference = {
  /** Rhino has concluded the inference (isUnderstood is now set) */
  isFinalized: boolean;
  /** The intent was understood (it matched an expression in the context) */
  isUnderstood?: boolean;
  /** The name of the intent */
  intent?: string;
  /** Map of the slot variables and values extracted from the utterance */
  slots?: Record<string, string>;
};

export type RhinoInferenceFinalized = {
  /** Rhino has concluded the inference (isUnderstood is now set) */
  isFinalized: true;
  /** The intent was understood (it matched an expression in the context) */
  isUnderstood: boolean;
  /** The name of the intent */
  intent?: string;
  /** Map of the slot variables and values extracted from the utterance */
  slots?: Record<string, string>;
};

export type RhinoInferenceUnderstood = {
  /** Rhino has concluded the inference (isUnderstood is now true) */
  isFinalized: true;
  /** The intent was understood (it matched an expression in the context) */
  isUnderstood: true;
  /** The name of the intent */
  intent: string;
  /** Map of the slot variables and values extracted from the utterance */
  slots?: Record<string, string>;
};

export interface RhinoEngine {
  /** The version of the Rhino engine */
  readonly version: string;
  /** The sampling rate of audio expected by the Rhino engine */
  readonly sampleRate: number;
  /** The frame length of audio expected by the Rhino engine */
  readonly frameLength: number;
  /** The source of the Rhino context (YAML format) */
  readonly contextInfo: string;
  /** Release all resources acquired by Rhino */
  release(): void;
  /** Process a single frame of 16-bit 16kHz PCM audio */
  process(frame: Int16Array): RhinoInference;
}

export type RhinoContext = {
  /** Base64 representation of a trained Rhino context (`.rhn` file) */
  base64: string;
  /** Value in range [0,1] that trades off miss rate for false alarm */
  sensitivity?: number;
};

export type RhinoWorkerResponseInference = {
  command: 'rhn-inference';
  inference: RhinoInference;
};

export type RhinoWorkerRequestInfo = {
  command: 'info';
};

export type RhinoWorkerResponseInfo = {
  command: 'rhn-info';
  info: string;
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
  accessKey: string;
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  requireEndpoint?: boolean;
  start?: boolean;
};

export type PicovoiceEngineArgs = {
  accessKey: string;
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  porcupineCallback: (keywordLabel: string) => void;
  rhinoCallback: (inference: RhinoInference) => void;
  requireEndpoint?: boolean;
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

export type WorkerRequestFileOperation = {
  command:
    | 'file-save-succeeded'
    | 'file-save-failed'
    | 'file-load-succeeded'
    | 'file-load-failed'
    | 'file-exists-succeeded'
    | 'file-exists-failed'
    | 'file-delete-succeeded'
    | 'file-delete-failed';
  message?: string;
  content?: string;
};

export type WorkerResponseFileOperation = {
  command:
    | 'file-save'
    | 'file-load'
    | 'file-exists'
    | 'file-delete'
    | 'file-save'
    | 'file-load'
    | 'file-exists'
    | 'file-delete';
  path: string;
  content?: string;
};

export type PicovoiceWorkerRequest =
  | PicovoiceWorkerRequestInit
  | WorkerRequestVoid
  | RhinoWorkerRequestInfo
  | WorkerRequestFileOperation;

export type PicovoiceWorkerResponse =
  | PicovoiceWorkerResponseErrorInit
  | PicovoiceWorkerResponseReady
  | PorcupineWorkerResponseKeyword
  | RhinoWorkerResponseInference
  | RhinoWorkerResponseInfo
  | WorkerResponseFileOperation;

export interface PicovoiceWorker extends Omit<Worker, 'postMessage'> {
  postMessage(command: PicovoiceWorkerRequest): void;
}

export interface PicovoiceWorkerFactory {
  create: (
    picovoiceWorkerArgs: PicovoiceWorkerArgs
  ) => Promise<PicovoiceWorker>;
}

export type PicovoiceServiceArgs = {
  accessKey: string;
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  requireEndpoint?: boolean;
  start?: boolean;
};
