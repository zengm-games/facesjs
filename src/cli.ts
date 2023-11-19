import fs from "node:fs";
import { parseArgs } from "node:util";
import { faceToSvgString } from "./faceToSvgString.js";
import { Gender, Race, generate } from "./generate.js";
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
    race: {
      type: "string",
      short: "r",
    },
    gender: {
      type: "string",
      short: "g",
    },
  },
});

if (options.help) {
  console.log(`Usage: facesjs [options...]

 -h, --help          Prints this help
 -o, --output        Output filename to use rather than stdout
 -f, --input-file    Path to a faces.js JSON file to convert to SVG
 -j, --input-json    String faces.js JSON object to convert to SVG
 -r, --race          Race - white/black/asian/brown, default is random
 -g, --gender        Gender - male/female, default is male
 
--input-file and --input-json can specify either an entire face object or a partial face object. If it's a partial face object, the other features will be random.

When called with no options, a random face is generated, converted to SVG, and sent to stdout.

EXAMPLES

Output a random face to stdout:
$ facesjs

Generage a blue female face and output to stdout:
$ facesjs -j '{"body":{"color":"blue"}}' -g female

Generage a male white face and save it to test.svg:
$ facesjs -r white -o test.svg`);
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

let race: Race | undefined;
if (options.race) {
  if (
    options.race === "white" ||
    options.race === "black" ||
    options.race === "asian" ||
    options.race === "brown"
  ) {
    race = options.race;
  } else {
    console.log("Invalid race");
    process.exit(1);
  }
}

let gender: Gender | undefined;
if (options.gender) {
  if (options.gender === "male" || options.gender === "female") {
    gender = options.gender;
  } else {
    console.log("Invalid gender");
    process.exit(1);
  }
}

const face = generate(overrides, {
  race,
  gender,
});
const svgString = faceToSvgString(face);
if (options.output === undefined) {
  console.log(svgString);
} else {
  fs.writeFileSync(options.output, svgString);
}
