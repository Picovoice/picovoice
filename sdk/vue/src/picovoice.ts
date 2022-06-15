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

/**
 * Type alias for PicovoiceWorkerFactory arguments.
 */
 export type PicovoiceWorkerFactoryArgs = {
  accessKey: string;
  porcupineKeyword: PorcupineKeyword;
  rhinoContext: RhinoContext;
  endpointDurationSec?: number;
  requireEndpoint?: boolean;
  start?: boolean;
}

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
    inferenceCallback: (inference: RhinoInference) => void,
    contextCallback: (info: string) => void,
    readyCallback: () => void,
    errorCallback: (error: Error) => void) => void;
    start: () => Promise<boolean>;
    stop: () => Promise<boolean>;
    pause: () => boolean;
    delete: () => void;
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
         * @param picovoiceFactoryArgs Arguments for PicovoiceWorkerFactory.
         * @param picovoiceFactory The language-specific worker factory
         * @param keywordCallback A method invoked when keyword is detected.
         * @param inferenceCallback A method invoked upon completion of intent inference.
         * @param contextCallback A method invoked after context information is ready.
         * @param readyCallback A method invoked after Picovoice has initialized.
         * @param errorCallback A method invoked if an error occurs within `PorcupineWorkerFactory`.
         */
        async init(
          picovoiceFactoryArgs,
          picovoiceFactory,
          keywordCallback = (_: string) => {},
          inferenceCallback = (_: RhinoInference) => {},
          contextCallback = (_: string) => {},
          readyCallback = () => {},
          errorCallback = (error: Error) => {console.error(error)}
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
          if (this.$_webVp_ !== null) {
            await this.$_webVp_.start();
            return true;
          }
          return false;
        },
        /**
         * Stop processing audio.
         */
         async stop() {
          if (this.$_webVp_ !== null) {
            await this.$_webVp_.stop();
            if (this.$_pvWorker_ !== null) {
              this.$_pvWorker_.postMessage({ command: 'reset' });
            }
            return true;
          }
          return false;
        },
        /**
         * Pause processing audio.
         */
        pause() {
          if (this.$_webVp_ !== null) {
            this.$_webVp_.pause();
            return true;
          }
          return false;
        },
        /**
         * Delete used resources.
         */
        delete() {
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
