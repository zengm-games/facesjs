module.exports = {
  input: "viewer/viewer.js",
  output: {
    file: "viewer/build/viewer.js",
    format: "iife",
    name: "faces"
  },
  watch: {
    chokidar: {
      paths: "src/**/*.js"
    }
  }
};
