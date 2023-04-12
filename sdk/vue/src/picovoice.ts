/*
  Copyright 2022-2023 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { reactive, Ref, ref, UnwrapNestedRefs, UnwrapRef, version } from 'vue';

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
} from "@picovoice/picovoice-web";

const createRef = <T>(data: T): Ref<UnwrapRef<T>> => {
  if (!ref || !version || version.charAt(0) < "3") {
    const obj = {
      value: data
    };

    return new Proxy(obj as Ref<UnwrapRef<T>>, {
      get(target, property, receiver): T {
        return Reflect.get(target, property, receiver);
      },
      set(target, property, newValue: T, receiver): boolean {
        return Reflect.set(target, property, newValue, receiver);
      }
    });
  }

  return ref<T>(data);
};

const createReactive = <T extends object>(data: T): UnwrapNestedRefs<T> => {
  if (!reactive || !version || version.charAt(0) < "3") {
    return data as UnwrapNestedRefs<T>;
  }

  return reactive<T>(data);
};

export type PicovoiceVue = {
  state: {
    wakeWordDetection: PorcupineDetection | null;
    inference: RhinoInference | null;
    contextInfo: string | null;
    isLoaded: boolean;
    isListening: boolean;
    error: Error | null;
  },
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
};

export function usePicovoice(): PicovoiceVue {
  const picovoiceRef = createRef<PicovoiceWorker | null>(null);

  const state = createReactive<{
    wakeWordDetection: PorcupineDetection | null;
    inference: RhinoInference | null;
    contextInfo: string | null;
    isLoaded: boolean;
    isListening: boolean;
    error: Error | null;
  }>({
    wakeWordDetection: null,
    inference: null,
    contextInfo: null,
    isLoaded: false,
    isListening: false,
    error: null,
  });

  const wakeWordCallback = (newDetection: PorcupineDetection): void => {
    if (newDetection) {
      state.wakeWordDetection = newDetection;
      state.inference = null;
    }
  };

  const inferenceCallback = (newInference: RhinoInference): void => {
    if (newInference) {
      state.inference = newInference;
      state.wakeWordDetection = null;
    }
  };

  const errorCallback = (newError: Error): void => {
    if (newError) {
      state.error = newError;
    }
  };

  const init = async (
    accessKey: string,
    keyword: PorcupineKeyword,
    porcupineModel: PorcupineModel,
    context: RhinoContext,
    rhinoModel: RhinoModel,
    options: PicovoiceOptions = {}
  ): Promise<void> => {
    try {
      if (!picovoiceRef.value) {
        if (options.processErrorCallback) {
          // eslint-disable-next-line no-console
          console.warn(
            'processErrorCallback is only supported in the Picovoice Web SDK. ' +
            "Use the 'error' state to monitor for errors in the Vue SDK."
          );
        }
        picovoiceRef.value = await PicovoiceWorker.create(
          accessKey,
          keyword,
          wakeWordCallback,
          porcupineModel,
          context,
          inferenceCallback,
          rhinoModel,
          { ...options, processErrorCallback: errorCallback }
        );
        state.contextInfo = picovoiceRef.value.contextInfo;
        state.isLoaded = true;
        state.error = null;
      }
    } catch (e: any) {
      state.error = e;
    }
  };

  const start = async (): Promise<void> => {
    try {
      if (!picovoiceRef.value) {
        state.error = new Error('Picovoice has not been initialized or has been released');
        return;
      }

      if (!state.isListening) {
        await WebVoiceProcessor.subscribe(picovoiceRef.value);
        state.isListening = true;
        state.error = null;
      }
    } catch (e: any) {
      state.error = e;
    }
  };

  const stop = async (): Promise<void> => {
    try {
      if (!picovoiceRef.value) {
        state.error = new Error('Picovoice has not been initialized or has been released');
        return;
      }

      if (state.isListening) {
        await WebVoiceProcessor.unsubscribe(picovoiceRef.value);
        picovoiceRef.value.reset();
        state.isListening = false;
        state.error = null;
      }
    } catch (e: any) {
      state.error = e;
    }
  };

  const release = async (): Promise<void> => {
    try {
      if (picovoiceRef.value) {
        await stop();
        picovoiceRef.value.terminate();
        picovoiceRef.value = null;
        state.isLoaded = false;
      }
    } catch (e: any) {
      state.error = e;
    }
  };

  return {
    state,
    init,
    start,
    stop,
    release,
  };
}
