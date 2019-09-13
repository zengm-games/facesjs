module.exports = {
  input: "public/bundle.js",
  output: {
    file: "public/build/bundle.js",
    format: "iife",
    name: "faces"
  },
  watch: {
    chokidar: {
      paths: "src/**/*.js"
    }
  }
};
