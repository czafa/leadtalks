// vite.config.js
import { defineConfig } from "vite";
import { resolve } from "path";

console.log("✅ Config Vite carregada");

export default defineConfig({
  base: "./",
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(__dirname, "index.html"),
    },
  },
});
