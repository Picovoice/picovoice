<template>
  <div class="voice-timer" v-bind:class="{ active: state.wakeWordDetection !== null }">
    <h1>Voice Timer</h1>
    <div v-if="!state.isLoaded">
      <label>
        AccessKey obtained from
        <a href="https://console.picovoice.ai/">Picovoice Console</a>:
        <input
          type="text"
          name="accessKey"
          v-on:change="updateAccessKey"
          :disabled="state.isLoaded"
        />
        <button
          class="start-button"
          v-on:click="initPicovoice"
          :disabled="accessKey.length === 0 || state.isLoaded"
        >
          Init Picovoice
        </button>
      </label>
    </div>
    <div v-if="state.isLoaded">
      <p>
        e.g. <i>"Computer, set a timer for one minute thirty two seconds"</i>
      </p>
      <p class="error-message" v-if="state.error !== null">
        {{ state.error }}
      </p>
      <p v-if="state.inference?.isUnderstood === false">
        Didn't understand that command. Please try again.
      </p>
    </div>
    <div class="timer">
      <div v-if="timeRemaining > 0" class="digits">
        {{ timeRemainingDisplay }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, ref, watch } from "vue";
import { usePicovoice } from "@picovoice/picovoice-vue";
import { BuiltInKeyword } from "@picovoice/porcupine-web";

const VoiceTimer = defineComponent({
  name: "VoiceWidget",
  setup() {
    const { state, init, start, release } = usePicovoice();

    const accessKey = ref("");
    const interval = ref<any>(null);
    const timeInitial = ref(0);
    const timeRemaining = ref(0);
    const timeRemainingDisplay = ref("");

    const updateAccessKey = (event: any) => {
      accessKey.value = event.target.value;
    };

    const initPicovoice = async () => {
      await init(
        accessKey.value,
        { builtin: BuiltInKeyword.Computer },
        { publicPath: "porcupine_params.pv", forceWrite: true },
        { publicPath: "clock_wasm.rhn", forceWrite: true },
        { publicPath: "rhino_params.pv", forceWrite: true }
      );
      await start();

      console.log(state.contextInfo)
    };

    onBeforeUnmount(() => {
      release();
    });

    const startTimer = () => {
      if (interval.value !== null) {
        clearInterval(interval.value);
      }
      interval.value = setInterval(() => {
        timeRemaining.value = timeRemaining.value - 1;
        if (timeRemaining.value <= 0) {
          clearInterval(interval.value);
        }
        const hours = Math.floor(timeRemaining.value / 3600);
        const minutes = Math.floor((timeRemaining.value - hours * 3600) / 60);
        const seconds = timeRemaining.value - hours * 3600 - minutes * 60;
        timeRemainingDisplay.value = `${hours
          .toString()
          .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }, 1000);
    };

    const pauseTimer = () => {
      if (interval.value !== null) {
        clearInterval(interval.value);
        interval.value = null;
      }
    };

    const stopTimer = () => {
      if (interval.value !== null) {
        clearInterval(interval.value);
        interval.value = null;
        timeRemaining.value = 0;
      }
    };

    watch(
      () => state.inference,
      (inference) => {
        console.log(inference)
        if (inference === null) {
          return;
        }

        let hours = 0,
          minutes = 0,
          seconds = 0,
          timerInSeconds = 0;
        if (inference.isUnderstood) {
          switch (inference.intent) {
            case "setTimer":
              if (inference.slots?.["hours"] !== undefined) {
                hours = parseInt(inference.slots["hours"]);
              }
              if (inference.slots?.["minutes"] !== undefined) {
                minutes = parseInt(inference.slots["minutes"]);
              }
              if (inference.slots?.["seconds"] !== undefined) {
                seconds = parseInt(inference.slots["seconds"]);
              }
              timerInSeconds = hours * 3600 + minutes * 60 + seconds;
              timeRemaining.value = timerInSeconds;
              timeInitial.value = timerInSeconds;
              startTimer();
              break;
            case "timer":
              if (inference.slots?.["action"] === "pause" || inference.slots?.["action"] === "stop") {
                pauseTimer();
              } else if (inference.slots?.["action"] === "reset") {
                timeRemaining.value = timeInitial.value;
                stopTimer();
              } else if (inference.slots?.["action"] === "start") {
                startTimer();
              }
              break;
          }
        }
      }
    );

    return {
      state,
      accessKey,
      timeRemaining,
      timeRemainingDisplay,
      updateAccessKey,
      initPicovoice,
      release,
    };
  },
});

export default VoiceTimer;
</script>

<style scoped>

.voice-timer {
  border: 20px solid #377dff;
  border-radius: 0.25rem;
  height: calc(100% - 6.5rem);
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

.start-button {
  padding: 0.1rem;
  font-size: 1rem;
  margin-left: 0.5rem;
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
