<template>
  <div>
    <h1>Picovoice Web + Vue ("Picovoice" Component)</h1>
    <br />
    <VoiceWidget />
  </div>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from "vue";

export default defineComponent({
  name: "App",
  components: {
    VoiceWidget: defineAsyncComponent(
      () => import("./components/VoiceWidget.vue")
    ),
  },
});
</script>

<style>
body {
  padding: 2rem;
}

button {
  padding: 1rem;
  font-size: 1.5rem;
  margin-right: 1rem;
}
</style>
