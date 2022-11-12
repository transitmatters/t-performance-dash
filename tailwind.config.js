/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    fontFamily: {
      display: ['Helvetica Neue', 'sans-serif'],
    },
    extend: {
      colors: {
        mbta: {
          red: '#da291c',
          lightRed: '#ea6359',
          orange: '#ed8b00',
          blue: '#003da5',
          green: '#00834d',
        },
        tm: {
          red: '#a31e1e',
          light_red: '#cb2525',
          grey: '#2e2d2c',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
