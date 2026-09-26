import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // The lazily loaded 3D scene is one ~250 kB (gzip) chunk, mostly three.js.
  build: { chunkSizeWarningLimit: 1000 },
});
