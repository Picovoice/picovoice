<template>
  <div>
    <slot />
  </div>
</template>

<script>
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

export default {
  name: 'Picovoice',
  props: {
    picovoiceFactoryArgs: [Object],
    picovoiceFactory: [Function],
  },
  data: function () {
    return { webVp: null, pvWorker: null };
  },
  methods: {
    async initEngine() {
      this.$emit('pv-loading');

      try {
        const {
          accessKey,
          porcupineKeyword,
          rhinoContext,
          requireEndpoint,
          start: startWebVp = true,
        } = this.picovoiceFactoryArgs;
        this.pvWorker = await this.picovoiceFactory.create({
          accessKey,
          porcupineKeyword,
          rhinoContext: JSON.parse(JSON.stringify(rhinoContext)),
          requireEndpoint,
          start: true,
        });
        this.webVp = await WebVoiceProcessor.init({
          engines: [this.pvWorker],
          start: startWebVp,
        });

        this.pvWorker.onmessage = messageEvent => {
          switch (messageEvent.data.command) {
            case 'ppn-keyword':
              this.$emit('ppn-keyword', messageEvent.data.keywordLabel);
              break;
            case 'rhn-inference':
              this.$emit('rhn-inference', messageEvent.data.inference);
              break;
            case 'rhn-info':
              this.$emit('rhn-info', messageEvent.data.info);
              break;
          }
        };
        this.pvWorker.postMessage({ command: 'info' });
        this.$emit('pv-ready');

      } catch (error) {
        this.$emit('pv-error', error);
      }
    },
    start() {
      if (this.webVp !== null) {
        this.webVp.start();
        return true;
      }
      return false;
    },
    pause() {
      if (this.webVp !== null) {
        this.webVp.pause();
        return true;
      }
      return false;
    },
  },
  beforeUnmount: function () {
    if (this.webVp !== null) {
      this.webVp.release();
      this.webVp = null;
    }
    if (this.pvWorker !== null) {
      this.pvWorker.postMessage({ command: 'release' });
      this.pvWorker = null;
    }
  },
};
</script>
