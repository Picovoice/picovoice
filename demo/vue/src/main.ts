import { createApp } from "vue";
import App from "./App.vue";

const picovoiceDemoApp = createApp(App)
picovoiceDemoApp.component('VoiceWidget',
  () => import('./components/VoiceWidget.vue')
)
picovoiceDemoApp.mount("#app");
