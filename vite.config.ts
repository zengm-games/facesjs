import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import chokidar from "chokidar";
import path from "node:path";
import { processSVGs } from "./tools/lib/process-svgs.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "watch-for-svg-changes",
      async configureServer(server) {
        await processSVGs();

        chokidar
          .watch([path.join(__dirname, "svgs")], {
            ignoreInitial: true,
          })
          .on("all", (event, filePath) => {
            console.log(`Detected change in SVGs: ${event} ${filePath}`);
            processSVGs();
          });
      },
    },
  ],
  server: {
    host: true,
    strictPort: true,
  },
});
