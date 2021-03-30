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
    resume() {
      if (this.webVp !== null) {
        this.webVp.resume();
        return true;
      }
      return false;
    },
  },
  async created() {
    this.$emit('pv-loading');

    try {
      this.pvWorker = await this.picovoiceFactory.create({
        ...this.picovoiceFactoryArgs,
        start: true,
      });
      let startWebVp;
      if (this.picovoiceFactoryArgs.start === undefined) {
        start = true;
      } else {
        startWebVp = this.picovoiceFactoryArgs.start;
      }
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
        }
      };
    } catch (error) {
      this.$emit('pv-error', error);
    }

    this.$emit('pv-ready');
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
