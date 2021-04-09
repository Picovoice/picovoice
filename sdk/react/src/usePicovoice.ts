import { useState, useEffect, useRef } from 'react';

import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

import {
  PicovoiceHookArgs,
  PicovoiceWorker,
  PicovoiceWorkerFactory,
  PicovoiceWorkerResponse,
  RhinoInference,
} from './picovoice_hook_types';

type EngineControlType = 'ppn' | 'rhn';

export function usePicovoice(
  picovoiceWorkerFactory: PicovoiceWorkerFactory | null,
  picovoiceHookArgs: PicovoiceHookArgs,
  keywordCallback: (keywordLabel: string) => void,
  inferenceCallback: (inference: RhinoInference) => void
): {
  contextInfo: string | null;
  isLoaded: boolean;
  isListening: boolean;
  isError: boolean;
  errorMessage: string | null;
  engine: EngineControlType;
  start: () => void;
  pause: () => void;
  resume: () => void;
} {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean>(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [engine, setEngine] = useState<EngineControlType>('ppn');
  const [
    webVoiceProcessor,
    setWebVoiceProcessor,
  ] = useState<WebVoiceProcessor>();
  const porcupineCallback = useRef(keywordCallback);
  const rhinoCallback = useRef(inferenceCallback);

  const start = (): boolean => {
    if (webVoiceProcessor !== undefined) {
      webVoiceProcessor.start();
      setIsListening(true);
      return true;
    }
    return false;
  };

  const pause = (): boolean => {
    if (webVoiceProcessor !== undefined) {
      webVoiceProcessor.pause();
      setIsListening(false);
      return true;
    }
    return false;
  };

  const resume = (): boolean => {
    if (webVoiceProcessor !== undefined) {
      webVoiceProcessor.resume();
      setIsListening(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (
      picovoiceWorkerFactory === null ||
      picovoiceWorkerFactory === undefined
    ) {
      return (): void => {
        /* NOOP */
      };
    }

    async function startPicovoice(): Promise<{
      webVp: WebVoiceProcessor;
      pvWorker: PicovoiceWorker;
    }> {
      const { start: startWebVp = true } = picovoiceHookArgs;
      // Argument checking; the engines will also do checking but we can get
      // clearer error messages from the hook
      if (picovoiceHookArgs.porcupineKeyword === undefined) {
        throw Error('porcupineKeyword is missing');
      }
      if (picovoiceHookArgs.rhinoContext === undefined) {
        throw Error('rhinoContext is missing');
      }
      if (typeof porcupineCallback.current !== 'function') {
        throw Error('porcupineCallback is not a function');
      }
      if (typeof rhinoCallback.current !== 'function') {
        throw Error('rhinoCallback is not a function');
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const pvWorker: PicovoiceWorker = await picovoiceWorkerFactory!.create({
        ...picovoiceHookArgs,
        start: true,
      });

      pvWorker.onmessage = (
        message: MessageEvent<PicovoiceWorkerResponse>
      ): void => {
        switch (message.data.command) {
          case 'ppn-keyword':
            porcupineCallback.current(message.data.keywordLabel);
            setEngine('rhn');
            break;
          case 'rhn-inference':
            rhinoCallback.current(message.data.inference);
            setEngine('ppn');
            break;
          case 'rhn-info':
            setContextInfo(message.data.info);
            break;
          default:
            break;
        }
      };

      pvWorker.postMessage({ command: 'info' });

      const webVp = await WebVoiceProcessor.init({
        engines: [pvWorker],
        start: startWebVp,
      });

      return { webVp, pvWorker };
    }
    const startPicovoicePromise = startPicovoice();

    startPicovoicePromise
      .then(({ webVp }) => {
        setIsLoaded(true);
        setIsListening(webVp.isRecording);
        setWebVoiceProcessor(webVp);
        setIsError(false);
      })
      .catch(error => {
        setIsError(true);
        setErrorMessage(error.toString());
      });

    return (): void => {
      startPicovoicePromise.then(({ webVp, pvWorker }) => {
        if (webVp !== undefined) {
          webVp.release();
        }
        if (pvWorker !== undefined) {
          pvWorker.postMessage({ command: 'release' });
        }
      });
    };
  }, [
    picovoiceWorkerFactory,
    // https://github.com/facebook/react/issues/14476#issuecomment-471199055
    // ".... we know our data structure is relatively shallow, doesn't have cycles,
    // and is easily serializable ... doesn't have functions or weird objects like Dates.
    // ... it's acceptable to pass [JSON.stringify(variables)] as a dependency."
    JSON.stringify(picovoiceHookArgs),
  ]);

  return {
    contextInfo,
    isLoaded,
    isListening,
    isError,
    errorMessage,
    engine,
    start,
    pause,
    resume,
  };
}
