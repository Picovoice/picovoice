import { useState, useEffect, useRef } from 'react';

import WebVoiceProcessor from '@picovoice/web-voice-processor';

import {
  PicovoiceWorker,
  PicovoiceWorkerArgs,
  PicovoiceWorkerFactory,
  PicovoiceWorkerResponse,
  RhinoInference,
} from './picovoice_hook_types';

type EngineControlType = 'ppn' | 'rhn';

export function usePicovoice(
  picovoiceWorkerFactory: PicovoiceWorkerFactory,
  picovoiceWorkerArgs: PicovoiceWorkerArgs,
  keywordCallback: (label: string) => void,
  inferenceCallback: (inference: RhinoInference) => void
): {
  isLoaded: boolean;
  isListening: boolean;
  isError: boolean;
  errorMessage: string;
  engine: EngineControlType;
  start: () => void;
  pause: () => void;
  resume: () => void;
} {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isError, setIsError] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [engine, setEngine] = useState(null);
  const [webVoiceProcessor, setWebVoiceProcessor] = useState(null);
  const porcupineCallback = useRef(keywordCallback);
  const rhinoCallback = useRef(inferenceCallback);

  const start = (): boolean => {
    if (webVoiceProcessor !== null) {
      webVoiceProcessor.start();
      setIsListening(true);
      return true;
    }
    return false;
  };

  const pause = (): boolean => {
    if (webVoiceProcessor !== null) {
      webVoiceProcessor.pause();
      setIsListening(false);
      return true;
    }
    return false;
  };

  const resume = (): boolean => {
    if (webVoiceProcessor !== null) {
      webVoiceProcessor.resume();
      setIsListening(true);
      return true;
    }
    return false;
  };

  useEffect(() => {
    async function startPicovoice(): Promise<{
      webVp: WebVoiceProcessor;
      pvWorker: PicovoiceWorker;
    }> {
      // Argument checking; the engines will also do checking but we can get
      // clearer error messages from the hook
      if (picovoiceWorkerArgs.porcupineKeyword === undefined) {
        throw Error('porcupineKeyword is missing');
      }
      if (picovoiceWorkerArgs.rhinoContext === undefined) {
        throw Error('rhinoContext is missing');
      }
      if (typeof porcupineCallback.current !== 'function') {
        throw Error('porcupineCallback is not a function');
      }
      if (typeof rhinoCallback.current !== 'function') {
        throw Error('rhinoCallback is not a function');
      }

      const pvWorker: PicovoiceWorker = await picovoiceWorkerFactory.create(
        picovoiceWorkerArgs
      );

      const webVp = await WebVoiceProcessor.init({
        engines: [pvWorker],
        start: picovoiceWorkerArgs.start,
      });

      setEngine('ppn');

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
          default:
            break;
        }
      };

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
    JSON.stringify(picovoiceWorkerArgs),
  ]);

  return {
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
