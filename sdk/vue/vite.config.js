const { fileURLToPath, URL } = require("node:url");

const { defineConfig } = require('vite')

/** @type {import('vite').UserConfig} */
module.exports = defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./test", import.meta.url)),
    },
  },
  optimizeDeps: {
    include: [
      "@/porcupine/porcupine_params.js",
      "@/keyword_files/picovoice_wasm.js",
      "@/rhino/rhino_params.js",
      "@/contexts/coffee_maker_wasm.js"
    ],
  },
});
