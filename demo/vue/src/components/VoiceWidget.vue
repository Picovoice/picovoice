<template>
  <div class="voice-widget">
    <Picovoice
      ref="picovoice"
      v-bind:picovoiceFactoryArgs="factoryArgs"
      v-bind:picovoiceFactory="factory"
      v-on:pv-ready="pvReadyFn"
      v-on:ppn-keyword="pvKeywordFn"
      v-on:rhn-inference="pvInferenceFn"
      v-on:rhn-info="pvInfoFn"
      v-on:pv-error="pvErrorFn"
    />
    <h2>VoiceWidget</h2>
    <h3>
      <label>
        AccessKey obtained from
        <a href="https://picovoice.ai/console/">Picovoice Console</a>:
        <input
          type="text"
          name="accessKey"
          v-on:change="initEngine"
          :disabled="isLoaded"
        />
      </label>
    </h3>
    <h3>Picovoice Loaded: {{ isLoaded }}</h3>
    <h3>Listening: {{ isListening }}</h3>
    <h3>Error: {{ isError }}</h3>
    <p class="error-message" v-if="isError">
      {{ JSON.stringify(errorMessage) }}
    </p>
    <h3>Engine: {{ engine }}</h3>
    <button v-on:click="start" :disabled="!isLoaded || isError || isListening">
      Start
    </button>
    <button v-on:click="pause" :disabled="!isLoaded || isError || !isListening">
      Pause
    </button>
    <h3>Keyword Detections (Listening for "Picovoice")</h3>
    <ul v-if="detections.length > 0">
      <li v-for="(item, index) in detections" :key="index">
        {{ item }}
      </li>
    </ul>
    <h3>Inference: (Follow-on commands in "Clock" context)</h3>
    <pre v-if="inference !== null">{{ JSON.stringify(inference, null, 2) }}</pre>
    <hr />
    <div>
      <h3>Context Info:</h3>
      <pre>{{ info }}</pre>
    </div>
  </div>
</template>

<script>
import Picovoice from "@picovoice/picovoice-web-vue";
import { PicovoiceWorkerFactory as PicovoiceWorkerFactoryEn } from "@picovoice/picovoice-web-en-worker";

import { CLOCK_EN_64 } from "../dist/rhn_contexts_base64";

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
      context64: CLOCK_EN_64,
      info: null,
      engine: null,
      factory: PicovoiceWorkerFactoryEn,
      factoryArgs: {
        accessKey: "",
        start: true,
        porcupineKeyword: 'Picovoice',
        rhinoContext: {
          base64: CLOCK_EN_64,
        },
      },
    };
  },
  methods: {
    initEngine: function (event) {
      this.factoryArgs.accessKey = event.target.value;
      this.isError = false;
      this.isLoaded = false;
      this.isListening = false;
      this.$refs.picovoice.initEngine();
    },
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

    pvReadyFn: function () {
      this.isLoaded = true;
      this.isListening = true;
      this.engine = "ppn";
    },
    pvInfoFn: function (info) {
      this.info = info;
    },
    pvKeywordFn: function (keyword) {
      this.detections = [...this.detections, keyword];
      this.engine = "rhn";
    },
    pvInferenceFn: function (inference) {
      this.inference = inference;
      this.engine = "ppn";
    },
    pvErrorFn: function (error) {
      this.isError = true;
      this.errorMessage = error.toString();
    },
  },
};
</script>

<style scoped>
button {
  padding: 1rem;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.voice-widget {
  border: 2px double #377dff;
  padding: 2rem;
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
