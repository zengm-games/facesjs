import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";

export default {
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
      include: "node_modules/**",
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
