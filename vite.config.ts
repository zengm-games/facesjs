import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import chokidar from "chokidar";
import { resolve } from "node:path";
import { processSVGs } from "./tools/lib/process-svgs.js";

export default defineConfig({
  base: "/facesjs",
  build: {
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
    outDir: "../build-site",
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "public/index.html"),
        editor: resolve(import.meta.dirname, "public/editor/index.html"),
      },
    },
  },
  plugins: [
    react(),
    {
      name: "process-svgs",
      async config() {
        // Always run this, for both build and dev
        await processSVGs();
      },
      async configureServer() {
        // Only during dev
        chokidar
          .watch([resolve(import.meta.dirname, "svgs")], {
            ignoreInitial: true,
          })
          .on("all", (event, filePath) => {
            console.log(`Detected change in SVGs: ${event} ${filePath}`);
            processSVGs();
          });
      },
    },
  ],
  root: "public",
});
