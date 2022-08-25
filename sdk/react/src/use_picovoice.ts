/*
  Copyright 2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { useState, useEffect, useRef, useCallback } from 'react';

import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

import {
  PicovoiceOptions,
  PicovoiceWorker,
  PorcupineDetection,
  PorcupineKeyword,
  PorcupineModel,
  RhinoContext,
  RhinoInference,
  RhinoModel,
} from '@picovoice/picovoice-web';

export function usePicovoice(): {
  wakeWordDetection: PorcupineDetection | null;
  inference: RhinoInference | null;
  contextInfo: string | null;
  isLoaded: boolean;
  isListening: boolean;
  error: string | null;
  init: (
    accessKey: string,
    keyword: PorcupineKeyword,
    porcupineModel: PorcupineModel,
    context: RhinoContext,
    rhinoModel: RhinoModel,
    options: PicovoiceOptions
  ) => Promise<void>;
  start: () => void;
  stop: () => void;
  release: () => void;
} {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [contextInfo, setContextInfo] = useState<string | null>(null);
  const [isError, setIsError] = useState<boolean | null>(false);
  const [isListening, setIsListening] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [engine, setEngine] = useState<EngineControlType>('ppn');
  const [
    picovoiceWorker,
    setPicovoiceWorker,
  ] = useState<PicovoiceWorker | null>(null);
  const [
    webVoiceProcessor,
    setWebVoiceProcessor,
  ] = useState<WebVoiceProcessor | null>(null);
  const porcupineCallback = useRef(keywordCallback);
  const rhinoCallback = useRef(inferenceCallback);

  const wakeWordCallback = useCallback(
    (detection: PorcupineDetection): void => {},
    []
  );

  const inferenceCallback = useCallback((inference: RhinoInference): void => {},
  []);

  const init = useCallback(
    async (
      accessKey: string,
      keyword: PorcupineKeyword,
      porcupineModel: PorcupineModel,
      context: RhinoContext,
      rhinoModel: RhinoModel,
      options: PicovoiceOptions = {}
    ): Promise<void> => {},
    [wakeWordCallback, inferenceCallback]
  );

  const start = useCallback(async (): Promise<void> => {}, []);

  const stop = useCallback(async (): Promise<void> => {}, []);

  const release = useCallback(async (): Promise<void> => {}, []);

  /** Refresh the keyword and inference callbacks
   * when they change (avoid stale closure) */
  useEffect(() => {
    porcupineCallback.current = keywordCallback;
    rhinoCallback.current = inferenceCallback;
  }, [keywordCallback, inferenceCallback]);

  useEffect(() => {
    if (
      picovoiceWorkerFactory === null ||
      picovoiceWorkerFactory === undefined
    ) {
      return (): void => {
        /* NOOP */
      };
    }

    if (picovoiceHookArgs === null || picovoiceHookArgs === undefined) {
      return (): void => {
        /* NOOP */
      };
    }

    async function startPicovoice(): Promise<{
      webVp: WebVoiceProcessor;
      pvWorker: PicovoiceWorker;
    }> {
      const { start: startWebVp = true } = picovoiceHookArgs!;

      // Argument checking; the engines will also do checking but we can get
      // clearer error messages from the hook
      if (picovoiceHookArgs!.porcupineKeyword === undefined) {
        throw Error('porcupineKeyword is missing');
      }
      if (picovoiceHookArgs!.rhinoContext === undefined) {
        throw Error('rhinoContext is missing');
      }
      if (typeof porcupineCallback.current !== 'function') {
        throw Error('porcupineCallback is not a function');
      }
      if (typeof rhinoCallback.current !== 'function') {
        throw Error('rhinoCallback is not a function');
      }

      const pvWorker: PicovoiceWorker = await picovoiceWorkerFactory!.create({
        ...picovoiceHookArgs!,
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

      try {
        const webVp = await WebVoiceProcessor.init({
          engines: [pvWorker],
          start: startWebVp,
        });

        return { webVp, pvWorker };
      } catch (error) {
        pvWorker.postMessage({ command: 'release' });
        throw error;
      }
    }
    const startPicovoicePromise = startPicovoice();

    startPicovoicePromise
      .then(({ webVp, pvWorker }) => {
        setIsLoaded(true);
        setIsListening(webVp.isRecording);
        setWebVoiceProcessor(webVp);
        setPicovoiceWorker(pvWorker);
        setIsError(false);
      })
      .catch(error => {
        setIsError(true);
        setErrorMessage(error.toString());
      });

    return (): void => {
      startPicovoicePromise
        .then(({ webVp, pvWorker }) => {
          if (webVp !== undefined && webVp !== null) {
            webVp.release();
          }
          if (pvWorker !== undefined && pvWorker !== undefined) {
            pvWorker.postMessage({ command: 'release' });
            pvWorker.terminate();
          }
        })
        .catch(() => {
          // do nothing
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
    webVoiceProcessor,
    start,
    pause,
    stop,
  };
}
