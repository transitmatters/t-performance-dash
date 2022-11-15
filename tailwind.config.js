import { COLORS } from './constants/colors'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}', 
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        mbta: {
          red: COLORS.mbta.red,
          orange: COLORS.mbta.orange,
          blue: COLORS.mbta.blue,
          green: COLORS.mbta.green,
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
