const chokidar = require("chokidar");
const path = require("path");
const rollup = require("rollup");
const rollupConfig = require("../rollup.config.js");
const processSVGs = require("./process-svgs");

processSVGs();

chokidar
  .watch([path.join(__dirname), path.join(__dirname, "..", "svgs")], {
    ignoreInitial: true,
  })
  .on("all", (event, path) => {
    processSVGs();
  });

const watcher = rollup.watch(rollupConfig);
watcher.on("event", (event) => {
  if (event.code === "END") {
    console.log(
      `Wrote new ${
        rollupConfig.output.file
      } at ${new Date().toLocaleTimeString()}`
    );
  } else if (event.code === "ERROR" || event.code === "FATAL") {
    console.log(event);
  }
});
