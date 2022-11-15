import { COLORS } from './constants/colors'
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
          red: COLORS.mbta.red,
          lightRed: COLORS.mbta.lightRed,
          orange: COLORS.mbta.orange,
          blue: COLORS.mbta.blue,
          green: COLORS.mbta.green,
        },
        tm: {
          red: COLORS.tm.red,
          lightRed: COLORS.tm.lightRed,
          grey: COLORS.tm.grey,
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
