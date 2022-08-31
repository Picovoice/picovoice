<template>
  <div class="voice-widget">
    <h2>VoiceWidget</h2>
    <h3>
      <label>
        AccessKey obtained from
        <a href="https://console.picovoice.ai/">Picovoice Console</a>:
        <input name="accessKey" type="text" v-on:change="updateInputValue" />
      </label>
      <button
        :disabled="isLoaded"
        class="start-button"
        v-on:click="initPicovoice"
      >
        Init Picovoice
      </button>
    </h3>
    <h3>Loaded: {{ isLoaded }}</h3>
    <h3>Listening: {{ isListening }}</h3>
    <h3>Error: {{ error !== null }}</h3>
    <p v-if="error !== null" class="error-message">
      {{ error.toString() }}
    </p>
    <button :disabled="!isLoaded || error || isListening" v-on:click="start">
      Start
    </button>
    <button :disabled="!isLoaded || error || !isListening" v-on:click="stop">
      Stop
    </button>
    <button :disabled="!isLoaded || error || isListening" v-on:click="release">
      Release
    </button>
    <div v-if="isListening">
      <h3 v-if="wakeWordDetection !== null">Wake word detected!</h3>
      <h3 v-else>Listening for 'Picovoice'...</h3>
    </div>
    <div v-if="isListening && inference !== null">
      <h3>Inference:</h3>
      <pre v-if="inference !== null">{{
        JSON.stringify(inference, null, 2)
      }}</pre>
    </div>
    <hr />
    <div>
      <h3>Context Info:</h3>
      <pre>{{ info }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import picovoiceMixin from "@picovoice/picovoice-vue";

import { PorcupineDetection, RhinoInference } from "@picovoice/picovoice-web";

const VoiceWidget = defineComponent({
  name: "VoiceWidget",
  mixins: [picovoiceMixin],
  data() {
    return {
      inputValue: "",
      wakeWordDetection: null as PorcupineDetection | null,
      inference: null as RhinoInference | null,
      isLoaded: false,
      isListening: false,
      error: null as string | null,
      info: null as string | null,
    };
  },
  methods: {
    start: function () {
      this.$picovoice.start();
    },
    stop: function () {
      this.$picovoice.stop();
    },
    release: function () {
      this.$picovoice.release();
    },
    initPicovoice: function () {
      this.$picovoice.init(
        this.inputValue,
        {
          label: "Picovoice",
          publicPath: "picovoice_wasm.ppn",
          forceWrite: true,
        },
        this.wakeWordCallback,
        { publicPath: "porcupine_params.pv", forceWrite: true },
        { publicPath: "clock_wasm.rhn", forceWrite: true },
        this.inferenceCallback,
        { publicPath: "rhino_params.pv", forceWrite: true },
        this.contextInfoCallback,
        this.isLoadedCallback,
        this.isListeningCallback,
        this.errorCallback
      );
    },
    updateInputValue: function (event: any) {
      this.inputValue = event.target.value;
    },
    wakeWordCallback: function (wakeWordDetection: PorcupineDetection) {
      this.inference = null;
      this.wakeWordDetection = wakeWordDetection;
    },
    inferenceCallback: function (inference: RhinoInference) {
      this.wakeWordDetection = null;
      this.inference = inference;
    },
    contextInfoCallback: function (info: string) {
      this.info = info;
    },
    isLoadedCallback: function (isLoaded: boolean) {
      this.isLoaded = isLoaded;
    },
    isListeningCallback: function (isListening: boolean) {
      this.isListening = isListening;
    },
    errorCallback: function (error: string | null) {
      this.error = error;
    },
  },
});

export default VoiceWidget;
</script>

<style scoped>
button {
  padding: 1rem;
  font-size: 1.5rem;
  margin-right: 1rem;
}

.start-button {
  padding: 0.1rem;
  font-size: 1rem;
  margin-left: 0.5rem;
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
