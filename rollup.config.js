const resolve = require("@rollup/plugin-node-resolve").default;
const babel = require("@rollup/plugin-babel").default;
const commonjs = require("@rollup/plugin-commonjs");

module.exports = {
  input: "public/bundle.js",
  output: {
    file: "public/build/bundle.js",
    format: "iife",
    name: "faces",
  },
  plugins: [
    resolve({
      extensions: [".ts", ".js"],
    }),
    commonjs({
      include: "node_modules/**", // Include all files within the src directory
    }),
    babel({
      babelHelpers: "bundled",
      extensions: [".ts", ".js"],
    }),
  ],
  watch: {
    chokidar: {
      paths: "src/**/*.ts",
    },
  },
};
