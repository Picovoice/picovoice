<template>
  <div class="voice-timer" v-bind:class="{ active: engine === 'rhn' }">
    <h1>Voice Timer</h1>
    <div v-if="isLoaded">
      <p>
        e.g. <i>"Computer, set a timer for one minute thirty two seconds"</i>
      </p>
      <p class="error-message" v-if="isError">
        {{ JSON.stringify(errorMessage) }}
      </p>

      <p v-if="inference?.isUnderstood === false">
        Didn't understand that command. Please try again.
      </p>
    </div>

    <div class="timer">
      <div v-if="timeRemaining > 0" class="digits">
        {{ timeRemainingDisplay }}
      </div>
    </div>

    <p v-if="!isLoaded">Loading...</p>

    <Picovoice
      ref="picovoice"
      v-bind:picovoiceFactoryArgs="{
        start: true,
        porcupineKeyword: { builtin: 'Computer', sensitivity: 0.7 },
        rhinoContext: {
          base64: context64,
        },
      }"
      v-bind:picovoiceFactory="factory"
      v-on:pv-init="pvInitFn"
      v-on:pv-ready="pvReadyFn"
      v-on:ppn-keyword="pvKeywordFn"
      v-on:rhn-inference="pvInferenceFn"
      v-on:rhn-info="pvInfoFn"
      v-on:pv-error="pvErrorFn"
    />
  </div>
</template>

<script>
import Picovoice from "@picovoice/picovoice-web-vue";
import { PicovoiceWorkerFactory as PicovoiceWorkerFactoryEn } from "@picovoice/picovoice-web-en-worker";

import { ALARM_EN_64 } from "../voice/base64";

export default {
  name: "VoiceWidget",
  components: {
    Picovoice,
  },
  data: function () {
    return {
      inference: null,
      detections: [],
      isError: false,
      isLoaded: false,
      isListening: false,
      isTalking: false,
      context64: ALARM_EN_64,
      interval: null,
      timeRemaining: 0,
      timeRemainingDisplay: "",
      timeInitial: null,
      info: null,
      engine: null,
      factory: PicovoiceWorkerFactoryEn,
    };
  },
  methods: {
    start: function () {
      if (this.$refs.picovoice.start()) {
        this.isListening = !this.isListening;
      }
    },
    pause: function () {
      if (this.$refs.picovoice.pause()) {
        this.isListening = !this.isListening;
      }
    },
    resume: function () {
      if (this.$refs.picovoice.resume()) {
        this.isListening = !this.isListening;
      }
    },
    pvInitFn: function () {
      this.isError = false;
    },
    pvReadyFn: function () {
      this.isLoaded = true;
      this.isListening = true;
      this.engine = "ppn";
    },
    pvInfoFn: function (info) {
      this.info = info;
    },
    pvKeywordFn: function (keyword) {
      console.log(keyword);
    },
    pvInferenceFn: function (inference) {
      console.log(inference);
    },
    pvErrorFn: function (error) {
      this.isError = true;
      this.errorMessage = error.toString();
    },
  },
};
</script>

<style scoped>
.voice-timer {
  border: 20px solid #377dff;
  border-radius: 0.25rem;
  height: 21rem;
  padding: 2rem;
}

.active {
  border-color: white;
}

button {
  padding: 1rem;
  font-size: 1.5rem;
  margin-right: 1rem;
}

h1 {
  text-align: center;
  margin-top: 4rem;
}

.timer {
  text-align: center;
}

.digits {
  font-size: 6rem;
  font-family: monospace;
}

.error-message {
  background-color: maroon;
  color: white;
  padding: 1rem;
  border-left: 5px solid red;
  font-family: monospace;
  font-weight: bold;
  font-size: 1.5rem;
}
</style>
