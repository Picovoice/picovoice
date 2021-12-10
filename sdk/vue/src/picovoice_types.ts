import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

/**
 * Type alias for the builtin keywords.
 */
export type PorcupineKeywordBuiltin = {
  builtin: string;
  sensitivity?: number;
}

/**
 * Type alias for the custom keywords.
 */
export type PorcupineKeywordCustom = {
  base64: string;
  custom: string;
  sensitivity?: number;
}

/**
 * Type alias for the Porcupine keywords which can be either PorcupineKeywordBuiltin or PorcupineKeywordCustom.
 */
export type PorcupineKeyword = PorcupineKeywordCustom | PorcupineKeywordBuiltin;

/**
 * Type alias for the Rhino context.
 */
export type RhinoContext = {
  base64: string;
  sensitivity?: number;
}

/**
 * Type alias for the Rhino inference.
 */
export type RhinoInferenceFinalized = {
  isFinalized: true;
  isUnderstood?: boolean;
  intent?: string;
  slots?: {[key: string]: string};
}

/**
 * Type alias for the active engine.
 */
export type EngineControlType = 'ppn' | 'rhn';

/**
 * Type alias for PicovoiceWorkerFactory arguments.
 */
export type PicovoiceWorkerFactoryArgs = {
  accessKey: string;
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  requireEndpoint?: boolean;
  start?: boolean;
}

/**
 * PicovoiceWorkerFactory: The language-specific worker factory, imported as { PicovoiceWorkerFactory } 
 * from the @picovoice/picovoice-web-xx-worker series of packages, where xx is the two-letter language code.
 */
 export interface PicovoiceWorkerFactory extends Object {
  create: (
    picovoiceArgs: PicovoiceWorkerFactoryArgs
  ) => Promise<Worker>,
};

/**
 * Type alias for Picovoice Vue Mixin.
 * Use with `Vue as VueConstructor extends {$picovoice: PicovoiceVue}` to get types in typescript.
 */
export interface PicovoiceVue {
  $_pvWorker_: Worker | null;
  $_webVp_: WebVoiceProcessor | null;
  init: (
    picovoiceFactoryArgs: PicovoiceWorkerFactoryArgs,
    picovoiceFactory: PicovoiceWorkerFactory,
    keywordCallback: (label: string) => void,
    inferenceCallback: (inference: RhinoInferenceFinalized) => void,
    contextCallback: (info: string) => void,
    readyCallback: () => void,
    errorCallback: (error: Error) => void) => void;
  start: () => boolean;
  pause: () => boolean;
  delete: () => void;
}
