/*
  Copyright 2022 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import {
  DetectionCallback,
  InferenceCallback,
  PicovoiceOptions,
  PicovoiceWorker,
  PorcupineKeyword,
  PorcupineModel,
  RhinoContext,
  RhinoModel,
} from '@picovoice/picovoice-web';

/**
 * Type alias for Picovoice Vue Mixin.
 * Use with `Vue as VueConstructor extends {$picovoice: PicovoiceVue}` to get types in typescript.
 */
export interface PicovoiceVue {
  $_picovoice_: PicovoiceWorker | null;
  init: (
    accessKey: string,
    keyword: PorcupineKeyword,
    wakeWordCallback: DetectionCallback,
    porcupineModel: PorcupineModel,
    context: RhinoContext,
    inferenceCallback: InferenceCallback,
    rhinoModel: RhinoModel,
    contextCallback: (info: string) => void,
    isLoadedCallback: (isLoaded: boolean) => void,
    isListeningCallback: (isListening: boolean) => void,
    errorCallback: (error: string | null) => void,
    options?: PicovoiceOptions
  ) => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  release: () => Promise<void>;
  isLoadedCallback: (isLoaded: boolean) => void;
  isListeningCallback: (isListening: boolean) => void;
  errorCallback: (error: string | null) => void;
}

export default {
  computed: {
    /**
     * Picovoice Vue Mixin.
     */
    $picovoice(): PicovoiceVue {
      return {
        $_picovoice_: null as PicovoiceWorker | null,
        isLoadedCallback: function (): void {
          return;
        },
        isListeningCallback: function (): void {
          return;
        },
        errorCallback: function (): void {
          return;
        },

        /**
         * Init function for Picovoice.
         *
         * @param accessKey AccessKey obtained from Picovoice Console.
         * @param keyword A Porcupine keyword. Can be provided as a built-in, base64 or a hosted `.ppn` file.
         * @param wakeWordCallback User-defined callback to run after a keyword is detected.
         * @param porcupineModel Contains the model parameters that are used to initialize the Porcupine engine.
         * Model can be encoded in base64 or can be stored in a `.pv` file in a public directory.
         * @param context A Rhino context. Can be provided as a base64 or a hosted `.rhn` file.
         * @param inferenceCallback User-defined callback invoked when Rhino has made an inference.
         * @param rhinoModel Contains the model parameters that are used to initialize the Rhino engine.
         * Model can be encoded in base64 or can be stored in a `.pv` file in a public directory.
         * @param options Optional configuration arguments.
         * @param options.endpointDurationSec Endpoint duration in seconds.
         * An endpoint is a chunk of silence at the end of an utterance that marks
         * the end of spoken command. It should be a positive number within [0.5, 5].
         * A lower endpoint duration reduces delay and improves responsiveness. A higher endpoint duration
         * assures Rhino doesn't return inference pre-emptively in case the user pauses before finishing the request.
         * @param options.requireEndpoint If set to `true`, Rhino requires an endpoint (a chunk of silence)
         * after the spoken command. If set to `false`, Rhino tries to detect silence, but if it cannot,
         * it still will provide inference regardless. Set to `false` only if operating in an
         * environment with overlapping speech (e.g. people talking in the background).
         * @param contextCallback A method invoked after Rhino context information is ready.
         * @param isLoadedCallback A method invoked once Picovoice has successfully initialized.
         * @param isListeningCallback A method invoked once audio processing has begun.
         * @param errorCallback A method invoked if an error occurs within Picovoice.
         */
        async init(
          accessKey: string,
          keyword: PorcupineKeyword,
          wakeWordCallback: DetectionCallback,
          porcupineModel: PorcupineModel,
          context: RhinoContext,
          inferenceCallback: InferenceCallback,
          rhinoModel: RhinoModel,
          contextCallback: (info: string) => void,
          isLoadedCallback: (isLoaded: boolean) => void,
          isListeningCallback: (isListening: boolean) => void,
          errorCallback: (error: string | null) => void,
          options: PicovoiceOptions = {}
        ): Promise<void> {
          if (options.processErrorCallback) {
            // eslint-disable-next-line no-console
            console.warn(
              "'processErrorCallback' is only supported in the Porcupine Web SDK. " +
                "Use the 'errorCallback' state to monitor for errors in the Vue SDK."
            );
          }

          try {
            if (!this.$_picovoice_) {
              this.$_picovoice_ = await PicovoiceWorker.create(
                accessKey,
                keyword,
                wakeWordCallback,
                porcupineModel,
                context,
                inferenceCallback,
                rhinoModel,
                { ...options, processErrorCallback: errorCallback }
              );

              this.isListeningCallback = isListeningCallback;
              this.isLoadedCallback = isLoadedCallback;
              this.errorCallback = errorCallback;
              isLoadedCallback(true);
              errorCallback(null);
            }
          } catch (error: any) {
            errorCallback(error.toString());
          }
        },
        /**
         * Start processing audio.
         */
        async start(): Promise<void> {
          try {
            if (!this.$_picovoice_) {
              this.errorCallback(
                'Picovoice has not been initialized or has been released'
              );
              return;
            }
            await WebVoiceProcessor.subscribe(this.$_picovoice_);
            this.isListeningCallback(true);
            this.errorCallback(null);
          } catch (error: any) {
            this.errorCallback(error.toString());
          }
        },
        /**
         * Stop processing audio.
         */
        async stop(): Promise<void> {
          try {
            if (!this.$_picovoice_) {
              this.errorCallback(
                'Picovoice has not been initialized or has been released'
              );
              return;
            }
            await WebVoiceProcessor.unsubscribe(this.$_picovoice_);
            this.isListeningCallback(false);
            this.errorCallback(null);
          } catch (error: any) {
            this.errorCallback(error.toString());
          }
        },
        /**
         * Release allocated resources.
         */
        async release(): Promise<void> {
          if (this.$_picovoice_) {
            await this.stop();
            this.$_picovoice_.terminate();
            this.$_picovoice_ = null;

            this.isLoadedCallback(false);
          }
        },
      };
    },
  },
  // Vue 3 method to clean resources.
  beforeUnmount(this: any): void {
    this.$picovoice.release();
  },
  // Vue 2 method to clean resources.
  beforeDestory(this: any): void {
    this.$picovoice.release();
  },
};
