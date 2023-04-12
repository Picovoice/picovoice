/*
  Copyright 2022-2023 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { useCallback, useEffect, useRef, useState } from 'react';

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
  error: Error | null;
  init: (
    accessKey: string,
    keyword: PorcupineKeyword,
    porcupineModel: PorcupineModel,
    context: RhinoContext,
    rhinoModel: RhinoModel,
    options?: PicovoiceOptions
  ) => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  release: () => Promise<void>;
  } {
  const picovoiceRef = useRef<PicovoiceWorker | null>(null);
  const [wakeWordDetection, setWakeWordDetection] =
    useState<PorcupineDetection | null>(null);
  const [inference, setInference] = useState<RhinoInference | null>(null);
  const [contextInfo, setContextInfo] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const wakeWordCallback = useCallback(
    (newDetection: PorcupineDetection): void => {
      if (newDetection) {
        setWakeWordDetection(newDetection);
        setInference(null);
      }
    },
    []
  );

  const inferenceCallback = useCallback(
    (newInference: RhinoInference): void => {
      if (newInference) {
        setInference(newInference);
        setWakeWordDetection(null);
      }
    },
    []
  );

  const errorCallback = useCallback((newError: Error): void => {
    if (newError) {
      setError(newError);
    }
  }, []);

  const init = useCallback(
    async (
      accessKey: string,
      keyword: PorcupineKeyword,
      porcupineModel: PorcupineModel,
      context: RhinoContext,
      rhinoModel: RhinoModel,
      options: PicovoiceOptions = {}
    ): Promise<void> => {
      try {
        if (!picovoiceRef.current) {
          if (options.processErrorCallback) {
            // eslint-disable-next-line no-console
            console.warn(
              'processErrorCallback is only supported in the Picovoice Web SDK. ' +
                "Use the 'error' state to monitor for errors in the React SDK."
            );
          }
          picovoiceRef.current = await PicovoiceWorker.create(
            accessKey,
            keyword,
            wakeWordCallback,
            porcupineModel,
            context,
            inferenceCallback,
            rhinoModel,
            { ...options, processErrorCallback: errorCallback }
          );
          setContextInfo(picovoiceRef.current.contextInfo);
          setIsLoaded(true);
          setError(null);
        }
      } catch (e: any) {
        setError(e);
      }
    },
    [wakeWordCallback, inferenceCallback, errorCallback]
  );

  const start = useCallback(async (): Promise<void> => {
    try {
      if (!picovoiceRef.current) {
        setError(new Error('Picovoice has not been initialized or has been released'));
        return;
      }

      if (!isListening) {
        await WebVoiceProcessor.subscribe(picovoiceRef.current);
        setIsListening(true);
        setError(null);
      }
    } catch (e: any) {
      setError(e);
    }
  }, [isListening]);

  const stop = useCallback(async (): Promise<void> => {
    try {
      if (!picovoiceRef.current) {
        setError(new Error('Picovoice has not been initialized or has been released'));
        return;
      }

      if (isListening) {
        await WebVoiceProcessor.unsubscribe(picovoiceRef.current);
        picovoiceRef.current.reset();
        setIsListening(false);
        setError(null);
      }
    } catch (e: any) {
      setError(e);
    }
  }, [isListening]);

  const release = useCallback(async (): Promise<void> => {
    try {
      if (picovoiceRef.current) {
        await stop();
        picovoiceRef.current.terminate();
        picovoiceRef.current = null;
        setIsLoaded(false);
      }
    } catch (e: any) {
      setError(e);
    }
  }, [stop]);

  useEffect(
    () => (): void => {
      if (picovoiceRef.current) {
        WebVoiceProcessor.unsubscribe(picovoiceRef.current);
        picovoiceRef.current.terminate();
        picovoiceRef.current = null;
      }
    },
    []
  );

  return {
    wakeWordDetection,
    inference,
    contextInfo,
    isLoaded,
    isListening,
    error,
    init,
    start,
    stop,
    release,
  };
}
