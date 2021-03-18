const fs = require("fs");
const path = require("path");
const SVGO = require("svgo");

const svgo = new SVGO();

const warning =
  "// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See tools/process-svgs.js";

const processSVGs = async () => {
  const svgFolder = path.join(__dirname, "..", "svg");

  const folders = fs.readdirSync(svgFolder);

  const svgs = {};

  for (const folder of folders) {
    if (folder === ".DS_Store") continue;
    svgs[folder] = {};

    const subfolder = path.join(svgFolder, folder);
    const files = fs.readdirSync(subfolder);
    for (const file of files) {
      if (file === ".DS_Store") continue;
      const key = path.basename(file, ".svg");

      const contents = fs.readFileSync(path.join(subfolder, file), "utf8");
      const result = await svgo.optimize(contents);

      // Replace <svg> and </svg> tags
      svgs[folder][key] = result.data
        .replace(/.*<svg.*?>/, "")
        .replace("</svg>", "");
    }
  }

  fs.writeFileSync(
    path.join(__dirname, "..", "src", "svgs.ts"),
    `${warning}\n\nexport default ${JSON.stringify(svgs)};`
  );

  const svgsIndex = {
    ...svgs,
  };
  for (const key of Object.keys(svgsIndex)) {
    svgsIndex[key] = Object.keys(svgsIndex[key]);
  }
  fs.writeFileSync(
    path.join(__dirname, "..", "src", "svgs-index.ts"),
    `${warning}\n\nexport default ${JSON.stringify(svgsIndex)};`
  );

  console.log(
    `Wrote new src/svgs.ts and src/svgs-index.ts at ${new Date().toLocaleTimeString()}`
  );
};

if (require.main === module) {
  processSVGs();
} else {
  module.exports = processSVGs;
}
