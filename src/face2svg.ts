/**
 * Build with:
 *
 *   yarn run build && yarn run build-cli
 *
 * Excute with:
 *
 *   node build/cli/face2svg.js
 *
 */

import { exit } from "process";
import { exportAsString } from "./exportAsString";
import { generate } from "./generate";
import { Overrides } from "./override";
import fs from "fs";

main(process.argv.slice(2)).catch((err) => console.error(err));

function printUsage() {
  console.log("Usage: face2svg INPUT [OUTPUT]");
  console.log();
  console.log("INPUT");
  console.log("You need to use one of the following:");
  console.log("  -r | --random                generates a random face");
  console.log(
    "  -f <FILE> | --face <FILE>    loads the json face definition from the given file"
  );
  console.log();
  console.log("OUTPUT");
  console.log(
    "  -o <OUT> | --output <OUT>    saves the SVG XML to the given file. By default, prints to the screen"
  );
  console.log();
}

interface Parameters {
  overrides: Overrides | undefined;
  destination?: string;
}

function parseArgs(args: string[]): Parameters {
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
        continue;
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
}

async function main(args: string[]) {
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
    try {
      fs.writeFileSync(parameters.destination, svgXml);
    } catch (err) {
      console.error(err);
    }
  }
}
