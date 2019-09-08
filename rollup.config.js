module.exports = {
  input: "src/index.js",
  output: {
    file: "build/index.js",
    format: "iife",
    name: "faces"
  },
  watch: {
    chokidar: {
      paths: "src/**/*.js"
    }
  }
};
