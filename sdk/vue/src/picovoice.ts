/*
  Copyright 2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import { PicovoiceWorkerFactory } from '@picovoice/picovoice-web-core';
import { PorcupineKeyword } from '@picovoice/porcupine-web-core';
import { RhinoContext, RhinoInference } from '@picovoice/rhino-web-core';
import {InferenceCallback, PicovoiceOptions, PorcupineModel, RhinoModel} from "@picovoice/picovoice-web";


/**
 * Type alias for Picovoice Vue Mixin.
 * Use with `Vue as VueConstructor extends {$picovoice: PicovoiceVue}` to get types in typescript.
 */
 export interface PicovoiceVue {
  $_pvWorker_: Worker | null;
  $_webVp_: WebVoiceProcessor | null;
  init: (
      accessKey: string,
      keyword: PorcupineKeyword,
      porcupineModel: PorcupineModel,
      context: RhinoContext,
      rhinoModel: RhinoModel,
      options: PicovoiceOptions,
      contextCallback: (info: string) => void,
      isLoadedCallback: (isLoaded: boolean) => void,
      isListeningCallback: (isListening: boolean) => void,
      errorCallback: (error: Error) => void) => void;
    start: () => Promise<void>;
    stop: () => Promise<void>;
    release: () => Promise<void>;
}

export default {
  computed: {
    /**
     * Picovoice Vue Mixin.
     */
    $picovoice(): PicovoiceVue {
      return {
        $_pvWorker_: null as Worker | null,
        $_webVp_: null as WebVoiceProcessor | null,
        /**
         * Init function for Picovoice.
         *
         * @param keyword
         * @param porcupineModel
         * @param context
         * @param rhinoModel
         * @param options
         * @param contextCallback A method invoked after context information is ready.
         * @param isLoadedCallback
         * @param isListeningCallback
         * @param errorCallback A method invoked if an error occurs within `PorcupineWorkerFactory`.
         */
        async init(
            keyword: PorcupineKeyword,
            porcupineModel: PorcupineModel,
            context: RhinoContext,
            rhinoModel: RhinoModel,
            options: PicovoiceOptions = {},
            contextCallback: (info: string) => void = (info: string) => {},
            isLoadedCallback: (isLoaded: boolean) => void = (isLoaded: boolean) => {},
            isListeningCallback: (isListening: boolean) => void = (isListening: boolean) => {},
            errorCallback: (error: Error) => void = (error: Error) => {})
        ) {
          try {
            const {
              accessKey,
              porcupineKeyword,
              rhinoContext,
              endpointDurationSec,
              requireEndpoint,
              start: startWebVp = true,
            } = picovoiceFactoryArgs;
            this.$_pvWorker_ = await picovoiceFactory.create({
              accessKey,
              porcupineKeyword: JSON.parse(JSON.stringify(porcupineKeyword)),
              rhinoContext: JSON.parse(JSON.stringify(rhinoContext)),
              endpointDurationSec,
              requireEndpoint,
              start: true,
            });
            this.$_webVp_ = await WebVoiceProcessor.init({
              engines: [this.$_pvWorker_],
              start: startWebVp,
            });

            this.$_pvWorker_.onmessage = messageEvent => {
              switch (messageEvent.data.command) {
                case 'ppn-keyword':
                  keywordCallback(messageEvent.data.keywordLabel);
                  break;
                case 'rhn-inference':
                  inferenceCallback(messageEvent.data.inference);
                  break;
                case 'rhn-info':
                  contextCallback(messageEvent.data.info);
                  break;
              }
            };
            this.$_pvWorker_.postMessage({ command: 'info' });
            readyCallback();
          } catch (error) {
            errorCallback(error as Error);
          }
        },
        /**
         * Start processing audio.
         */
        async start() {
          // if (this.$_webVp_ !== null) {
          //   await this.$_webVp_.start();
          //   return true;
          // }
          // return false;
        },
        /**
         * Stop processing audio.
         */
         async stop() {
          // if (this.$_webVp_ !== null) {
          //   await this.$_webVp_.stop();
          //   if (this.$_pvWorker_ !== null) {
          //     this.$_pvWorker_.postMessage({ command: 'reset' });
          //   }
          //   return true;
          // }
          // return false;
        },
        /**
         * Delete used resources.
         */
        async release() {
          this.$_webVp_?.release();
          this.$_pvWorker_?.postMessage({ command: 'release' });
          this.$_pvWorker_?.terminate();
        }
      }
    }
  },
  // Vue 3 method to clean resources.
  beforeUnmount(this: any) {
    this.$picovoice.delete();
  },
  // Vue 2 method to clean resources.
  beforeDestory(this: any) {
    this.$picovoice.delete();
  }
};
