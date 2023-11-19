import fs from "node:fs";
import { exit } from "node:process";
import { exportAsString } from "./exportAsString.js";
import { generate } from "./generate.js";
import { Overrides } from "./override.js";

const printUsage = () => {
  console.log(`Usage: face2svg INPUT [OUTPUT]

INPUT
You need to use one of the following:
  -r | --random                generates a random face
  -f <FILE> | --face <FILE>    loads the json face definition from the given file

OUTPUT
  -o <OUT> | --output <OUT>    saves the SVG XML to the given file. By default, prints to the screen
`);
};

type Parameters = {
  overrides: Overrides | undefined;
  destination: string | undefined;
};

const parseArgs = (args: string[]): Parameters => {
  let overrides: Overrides | undefined;
  let destination: string | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "-r" || args[i] === "--random") {
      overrides = {};
      continue;
    }

    if (args[i] === "-f" || args[i] === "--face") {
      i++;
      if (!args[i]) {
        console.log(`Missing argument for ${args[-1]}`);
        exit(1);
      }
      try {
        const json = fs.readFileSync(args[i], "utf8");
        overrides = JSON.parse(json);
      } catch (err) {
        console.error(`Could not read face definition from ${args[i]}`, err);
        exit(1);
      }
      continue;
    }

    if (args[i] === "-o" || args[i] === "--output") {
      i++;
      if (!args[i]) {
        console.log(`Missing argument for ${args[-1]}`);
        exit(1);
      }
      destination = args[i];
      continue;
    }
  }

  if (overrides === undefined) {
    console.log("You need to specify the input with either -r or -f");
    exit(1);
  }

  return {
    overrides,
    destination,
  };
};

const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
  exit(0);
}

const parameters = parseArgs(args);
const face = generate(parameters.overrides);
const svgXml = exportAsString(face, {});
if (parameters.destination === undefined) {
  console.log(svgXml);
} else {
  fs.writeFileSync(parameters.destination, svgXml);
}
