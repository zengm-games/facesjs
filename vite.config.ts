import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";
import chokidar from "chokidar";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "watch-for-svg-changes",
      configureServer(server) {
        let processSVGs;
        if (typeof window === "undefined") {
          processSVGs = require("./tools/process-svgs.js").processSVGs;
        }

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
