import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";

export default {
  input: "public/bundle.js",
  output: {
    file: "build-site/bundle.js",
    format: "iife",
    name: "faces",
  },
  plugins: [
    resolve({
      extensions: [".ts", ".js"],
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
