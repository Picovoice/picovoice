<template>
  <VoiceTimer />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import VoiceTimer from "./components/VoiceTimer.vue";

export default defineComponent({
  name: "App",
  components: {
    VoiceTimer,
  },
});
</script>

<style lang="scss">
body {
  background-color: #377dff;
  color: white;
  font-family: "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
    "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  height: 100vh;
  margin: 0;
}

#app {
  height: 100%;
}
</style>
