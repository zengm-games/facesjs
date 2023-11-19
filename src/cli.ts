import fs from "node:fs";
import { parseArgs } from "node:util";
import { exportAsString } from "./exportAsString.js";
import { generate } from "./generate.js";
import { Overrides } from "./override.js";

const { values: options } = parseArgs({
  options: {
    help: {
      type: "boolean",
      short: "h",
      default: false,
    },
    output: {
      type: "string",
      short: "o",
    },
    "input-file": {
      type: "string",
      short: "f",
    },
    "input-json": {
      type: "string",
      short: "j",
    },
  },
});

if (options.help) {
  console.log(`Usage: facesjs [options...]

 -h, --help          Prints this help
 -o, --output        Output filename to use rather than stdout
 -f, --input-file    Path to a faces.js JSON file to convert to SVG
 -j, --input-json    String faces.js JSON object to convert to SVG
 
--input-file and --input-json can specify either an entire face object or a partial face object. If it's a partial face object, the other features will be random.

When called with no options, a random face is generated, converted to SVG, and sent to stdout.`);
  process.exit(0);
}

if (options["input-file"] && options["input-json"]) {
  console.log("--input-file and --input-json cannot be specified together");
  process.exit(1);
}

let overrides: Overrides | undefined;

if (options["input-file"]) {
  const json = fs.readFileSync(options["input-file"], "utf8");
  overrides = JSON.parse(json);
} else if (options["input-json"]) {
  overrides = JSON.parse(options["input-json"]);
}

const face = generate(overrides);
const svgString = exportAsString(face);
if (options.output === undefined) {
  console.log(svgString);
} else {
  fs.writeFileSync(options.output, svgString);
}
