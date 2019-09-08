const fs = require("fs");
const path = require("path");
const splitLines = require("split-lines");

const svgFolder = path.join(__dirname, "..", "svg");

const folders = fs.readdirSync(svgFolder);

const svgs = {};

for (const folder of folders) {
  svgs[folder] = {};

  const subfolder = path.join(svgFolder, folder);
  const files = fs.readdirSync(subfolder);
  for (const file of files) {
    const contents = fs.readFileSync(path.join(subfolder, file), "utf8");
    const lines = splitLines(contents)
      .filter(
        line =>
          line !== "" &&
          !line.includes("<?xml") &&
          !line.includes("<svg") &&
          !line.includes("</svg>")
      )
      .map(line => line.trim());

    const key = path.basename(file, ".svg");
    svgs[folder][key] = lines.join("");
  }
}

const json = JSON.stringify(svgs, null, 2);
fs.writeFileSync(
  path.join(__dirname, "..", "src", "svgs.js"),
  `// THIS IS A GENERATED FILE, DO NOT EDIT BY HAND!\n// See tools/process-svgs.js\n\nexport default ${json};`
);
