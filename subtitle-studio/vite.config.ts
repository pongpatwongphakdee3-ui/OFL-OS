import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// FFmpeg.wasm ships its own worker + wasm core that Vite should not try to
// pre-bundle, otherwise the worker URL resolution breaks at runtime.
export default defineConfig({
  plugins: [react()],
  base: "./",
  optimizeDeps: {
    exclude: ["@ffmpeg/ffmpeg", "@ffmpeg/util"],
  },
  server: {
    port: 5173,
  },
});
