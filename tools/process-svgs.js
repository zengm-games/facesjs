const fs = require("fs");
const path = require("path");
const SVGO = require("svgo");

const svgo = new SVGO();

const processSVGs = async () => {
  const svgFolder = path.join(__dirname, "..", "svg");

  const folders = fs.readdirSync(svgFolder);

  const svgs = {};

  for (const folder of folders) {
    svgs[folder] = {};

    const subfolder = path.join(svgFolder, folder);
    const files = fs.readdirSync(subfolder);
    for (const file of files) {
      const key = path.basename(file, ".svg");

      const contents = fs.readFileSync(path.join(subfolder, file), "utf8");
      const result = await svgo.optimize(contents);
      console.log("result", result);

      // Replace <svg> and </svg> tags
      svgs[folder][key] = result.data
        .replace(/.*<svg.*?>/, "")
        .replace("</svg>", "");
    }
  }

  const json = JSON.stringify(svgs, null, 2);
  fs.writeFileSync(
    path.join(__dirname, "..", "src", "svgs.js"),
    `// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See tools/process-svgs.js\n\nexport default ${json};`
  );
  console.log(`Wrote new src/svgs.js at ${new Date().toLocaleTimeString()}`);
};

if (require.main === module) {
  processSVGs();
} else {
  module.exports = processSVGs;
}
