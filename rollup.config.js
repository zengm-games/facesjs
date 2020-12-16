const resolve = require("@rollup/plugin-node-resolve").default;
const babel = require("@rollup/plugin-babel").default;

module.exports = {
  input: "public/bundle.js",
  output: {
    file: "public/build/bundle.js",
    format: "iife",
    name: "faces",
  },
  plugins: [
    babel({
      babelHelpers: "bundled",
      extensions: [".ts", ".js"],
    }),
    resolve({
      extensions: [".ts", ".js"],
    }),
  ],
  watch: {
    chokidar: {
      paths: "src/**/*.ts",
    },
  },
};
