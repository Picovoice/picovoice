<template>
  <div class="voice-widget">
    <h2>VoiceWidget</h2>
    <h3>
      <label>
        AccessKey obtained from
        <a href="https://console.picovoice.ai/">Picovoice Console</a>:
        <input name="accessKey" type="text" v-on:change="updateAccessKey" />
      </label>
      <button
        :disabled="state.isLoaded"
        class="start-button"
        v-on:click="initPicovoice"
      >
        Init Picovoice
      </button>
    </h3>
    <h3>Loaded: {{ state.isLoaded }}</h3>
    <h3>Listening: {{ state.isListening }}</h3>
    <h3>Error: {{ state.error !== null }}</h3>
    <p v-if="state.error !== null" class="error-message">
      {{ state.error.toString() }}
    </p>
    <button
      v-on:click="start"
      :disabled="!state.isLoaded || !!state.error || state.isListening"
    >
      Start
    </button>
    <button
      v-on:click="stop"
      :disabled="!state.isLoaded || !!state.error || !state.isListening"
    >
      Stop
    </button>
    <button v-on:click="release" :disabled="!state.isLoaded || !!state.error">
      Release
    </button>
    <div v-if="state.isListening">
      <h3 v-if="state.wakeWordDetection !== null">Wake word detected!</h3>
      <h3 v-else>Listening for '{{ wakeWordName }}'...</h3>
    </div>
    <div v-if="state.isListening && state.inference !== null">
      <h3>Inference:</h3>
      <pre v-if="state.inference !== null">{{
        JSON.stringify(state.inference, null, 2)
      }}</pre>
    </div>
    <hr />
    <div>
      <h3>Context Name: {{ contextName }}</h3>
      <h3>Context Info:</h3>
      <pre>{{ state.contextInfo }}</pre>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref } from "vue";

import { usePicovoice } from "@picovoice/picovoice-vue";

// @ts-ignore
import porcupineWakeWord from "../lib/porcupineWakeWord";

// @ts-ignore
import rhinoContext from "../lib/rhinoContext";

// @ts-ignore
import { porcupineModel, rhinoModel } from "../lib/picovoiceModels";

const VoiceWidget = defineComponent({
  name: "VoiceWidget",
  setup() {
    const { state, init, start, stop, release } = usePicovoice();

    const wakeWordName = porcupineWakeWord.label;
    const contextName = rhinoContext.publicPath
      .split("/")
      .pop()
      .replace("_wasm.rhn", "");

    const accessKey = ref("");

    const updateAccessKey = (event: any) => {
      accessKey.value = event.target.value;
    };

    const initPicovoice = () => {
      init(
        accessKey.value,
        porcupineWakeWord,
        porcupineModel,
        rhinoContext,
        rhinoModel
      );
    };

    onBeforeUnmount(() => {
      release();
    });

    return {
      state,
      accessKey,
      updateAccessKey,
      contextName,
      wakeWordName,
      initPicovoice,
      start,
      stop,
      release,
    };
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
