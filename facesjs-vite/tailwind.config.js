/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    './node_modules/@rewind-ui/core/dist/theme/styles/*.js',
    './node_modules/@rewind-ui/core/dist/theme/styles/*.ts',
    './node_modules/@rewind-ui/core/dist/theme/styles/*.*.js',
    './node_modules/@rewind-ui/core/dist/theme/styles/*.*.ts',
    './node_modules/@rewind-ui/core/src/theme/styles/Switch.styles.ts',
    './node_modules/@rewind-ui/core/src/theme/styles/*.ts'
  ],
  theme: {
    extend: {},
  },
  purge: {
    safelist: ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5'],
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar')({ nocompatible: true }),
    require('@tailwindcss/forms')({
      strategy: 'class'
    })
  ],
};
