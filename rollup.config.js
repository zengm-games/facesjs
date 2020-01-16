const resolve = require("@rollup/plugin-node-resolve");
const babel = require("rollup-plugin-babel");

module.exports = {
  input: "public/bundle.js",
  output: {
    file: "public/build/bundle.js",
    format: "iife",
    name: "faces"
  },
  plugins: [
    babel({
      extensions: [".ts", ".js"]
    }),
    resolve({
      extensions: [".ts", ".js"]
    })
  ],
  watch: {
    chokidar: {
      paths: "src/**/*.ts"
    }
  }
};
