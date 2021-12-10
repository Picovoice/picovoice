import { WebVoiceProcessor } from '@picovoice/web-voice-processor';
import { PicovoiceVue, RhinoInferenceFinalized } from './picovoice_types';

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
          inferenceCallback = (_: RhinoInferenceFinalized) => {},
          contextCallback = (_: string) => {},
          readyCallback = () => {},
          errorCallback = (error: Error) => {console.error(error)}
        ) {
          try {
            const {
              accessKey,
              porcupineKeyword,
              rhinoContext,
              requireEndpoint,
              start: startWebVp = true,
            } = picovoiceFactoryArgs;
            this.$_pvWorker_ = await picovoiceFactory.create({
              accessKey,
              porcupineKeyword: JSON.parse(JSON.stringify(porcupineKeyword)),
              rhinoContext: JSON.parse(JSON.stringify(rhinoContext)),
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
        start() {
          if (this.$_webVp_ !== null) {
            this.$_webVp_.start();
            return true;
          }
          return false;
        },
        /**
         * Stop processing audio.
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
