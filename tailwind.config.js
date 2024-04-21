import { nextui } from "@nextui-org/react";
import typography from "@tailwindcss/typography";
import scrollbar from "tailwind-scrollbar";
import forms from "@tailwindcss/forms";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./public/editor/index.html",
    "./public/editor/*.{html,js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [
    typography,
    scrollbar({ nocompatible: true }),
    forms({
      strategy: "class",
    }),
    nextui(),
  ],
};
