import fs from "node:fs/promises";
import path from "node:path";
import { loadConfigFile } from "rollup/loadConfigFile";
import { rollup } from "rollup";

await fs.mkdir(path.resolve(import.meta.dirname, "../build-site"));
await fs.copyFile(
  path.resolve(import.meta.dirname, "../public/index.html"),
  path.resolve(import.meta.dirname, "../build-site/index.html"),
);

// https://rollupjs.org/javascript-api/#programmatically-loading-a-config-file
const { options, warnings } = await loadConfigFile(
  path.resolve(import.meta.dirname, "../rollup.config.js"),
  {
    format: "es",
  },
);
console.log(`We currently have ${warnings.count} warnings`);
warnings.flush();
for (const optionsObj of options) {
  const bundle = await rollup(optionsObj);
  await Promise.all(optionsObj.output.map(bundle.write));
}
