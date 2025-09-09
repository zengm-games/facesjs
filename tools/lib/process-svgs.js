import fs from "node:fs";
import path from "node:path";
import { optimize } from "svgo";
import { genders } from "./genders.js";

const warning =
  "// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See tools/process-svgs.js";

const processSVGs = async () => {
  const svgFolder = path.join(import.meta.dirname, "..", "..", "svgs");

  const folders = fs.readdirSync(svgFolder);

  const svgs = {};

  for (const folder of folders) {
    if (folder === ".DS_Store") continue;
    svgs[folder] = {};

    const subfolder = path.join(svgFolder, folder);
    const files = fs.readdirSync(subfolder);
    for (const file of files) {
      if (!file.endsWith(".svg")) continue;
      const key = path.basename(file, ".svg");

      const contents = fs.readFileSync(path.join(subfolder, file), "utf8");
      const result = await optimize(contents, {
        multipass: true,
        plugins: [
          "preset-default",
          {
            name: "inlineStyles",
            params: {
              onlyMatchedOnce: false,
            },
          },

          // After inlineStyles, and remaining classes are extraneous ones that should be deleted to avoid conflict
          {
            name: "removeAttrs",
            params: {
              attrs: "(class)",
            },
          },
        ],
      });

      // Replace <svg> and </svg> tags
      svgs[folder][key] = result.data
        .replace(/.*<svg.*?>/, "")
        .replace("</svg>", "");
    }
  }

  fs.writeFileSync(
    path.join(import.meta.dirname, "..", "..", "src", "svgs.ts"),
    `${warning}\n\nexport default ${JSON.stringify(svgs)};`,
  );

  const svgsIndex = {
    ...svgs,
  };
  for (const key of Object.keys(svgsIndex)) {
    svgsIndex[key] = Object.keys(svgsIndex[key]);
  }
  const svgsGenders = {
    ...svgsIndex,
  };
  for (const key of Object.keys(svgsGenders)) {
    const keyGenders = [];
    for (const featureName of svgsGenders[key]) {
      let gender = genders[key][featureName];
      if (gender === undefined) {
        console.log(`Unknown gender for ${key}/${featureName}`);
        gender = "female";
      }
      keyGenders.push(gender);
    }
    svgsGenders[key] = keyGenders;
  }
  fs.writeFileSync(
    path.join(import.meta.dirname, "..", "..", "src", "svgs-index.ts"),
    `${warning}\n\nexport const svgsIndex = ${JSON.stringify(
      svgsIndex,
    )} as const;\n\nexport const svgsGenders = ${JSON.stringify(svgsGenders)} as const;`,
  );

  console.log(
    `Wrote new src/svgs.ts and src/svgs-index.ts at ${new Date().toLocaleTimeString()}`,
  );
};

export { processSVGs };
