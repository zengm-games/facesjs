import fs from "node:fs/promises";
import path from "node:path";
import * as esbuild from "esbuild";

await fs.mkdir(path.resolve(import.meta.dirname, "../build-site"));
await fs.copyFile(
  path.resolve(import.meta.dirname, "../public/index.html"),
  path.resolve(import.meta.dirname, "../build-site/index.html"),
);

await esbuild.build({
  entryPoints: ["public/bundle.js"],
  bundle: true,
  minify: true,
  format: "esm",
  outfile: "build-site/bundle.js",
});
