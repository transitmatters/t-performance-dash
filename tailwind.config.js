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
          red: '#da291c',
          orange: '#ed8b00',
          blue: '#003da5',
          green: '#00834d',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
