import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/Face.tsx", "src/cli.ts"],
  outDir: "build",
  fixedExtension: false,
  dts: true,
});
