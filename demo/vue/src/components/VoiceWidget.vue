<template>
  <div class="voice-widget">
    <h2>VoiceWidget</h2>
    <h3>
      <label>
        AccessKey obtained from
        <a href="https://console.picovoice.ai/">Picovoice Console</a>:
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
    <button v-on:click="stop" :disabled="!isLoaded || isError || !isListening">
      Stop
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

<script lang="ts">
import Vue, { VueConstructor } from 'vue';

type EngineControlType = "ppn" | "rhn";

import picovoiceMixin, {
  PicovoiceVue,
} from "@picovoice/picovoice-web-vue";
import { PicovoiceWorkerFactory as PicovoiceWorkerFactoryEn } from "@picovoice/picovoice-web-en-worker";
import { RhinoInference } from "@picovoice/rhino-web-core";

import { CLOCK_EN_64 } from "../dist/rhn_contexts_base64";

export default (Vue as VueConstructor<Vue & {$picovoice: PicovoiceVue}>).extend({
  name: "VoiceWidget",
  mixins: [picovoiceMixin],
  data: function () {
    return {
      inference: null as RhinoInference | null,
      detections: [] as string[],
      isError: false,
      errorMessage: '',
      isLoaded: false,
      isListening: false,
      isTalking: false,
      context64: CLOCK_EN_64,
      info: null as string | null,
      engine: null as EngineControlType | null,
      factory: PicovoiceWorkerFactoryEn,
      factoryArgs: {
        accessKey: "",
        start: true,
        porcupineKeyword: {
          builtin: 'Picovoice'
        },
        rhinoContext: {
          base64: CLOCK_EN_64,
        },
      },
    };
  },
  methods: {
    initEngine: function (event: any) {
      this.factoryArgs.accessKey = event.target.value;
      this.isError = false;
      this.isLoaded = false;
      this.isListening = false;
      this.$picovoice.init(
        this.factoryArgs,
        this.factory,
        this.pvKeywordFn,
        this.pvInferenceFn,
        this.pvInfoFn,
        this.pvReadyFn,
        this.pvErrorFn
      );
    },
    start: function () {
      if (this.$picovoice.start()) {
        this.isListening = !this.isListening;
      }
    },
    stop: function () {
      if (this.$picovoice.stop()) {
        this.isListening = !this.isListening;
        this.engine = "ppn";
      }
    },
    pause: function () {
      if (this.$picovoice.pause()) {
        this.isListening = !this.isListening;
      }
    },
    pvReadyFn: function () {
      this.isLoaded = true;
      this.isListening = true;
      this.engine = "ppn";
    },
    pvInfoFn: function (info: string) {
      this.info = info;
    },
    pvKeywordFn: function (keyword: string) {
      this.detections = [...this.detections, keyword];
      this.engine = "rhn";
    },
    pvInferenceFn: function (inference: RhinoInference) {
      this.inference = inference;
      this.engine = "ppn";
    },
    pvErrorFn: function (error: Error) {
      this.isError = true;
      this.errorMessage = error.toString();
    },
  },
});
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
