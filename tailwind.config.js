/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './common/**/*.{js,ts,jsx,tsx}',
    './modules/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    './node_modules/tailwind-datepicker-react/dist/**/*.js',
  ],
  safelist: [
    {
      pattern:
        /(border|text|bg)-mbta-(red|lightRed|orange|lightOrange|blue|lightBlue|green|lightGreen|bus|lightBus)/,
    },
  ],
  darkMode: 'class',
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    fontFamily: {
      display: ['Helvetica Neue', 'sans-serif'],
    },
    extend: {
      boxShadow: {
        figma: '4px 4px 0 #DA291C',
        dataBox: '1px 1px 4px rgba(0, 0, 0, 0.1);',
        tappedDataBox: 'inset 1px 1px 4px rgba(0, 0, 0, 0.2);',
        unselectedLine: '1px 1px 2px rgba(0, 0, 0, 0.2);',
        selectedLine: 'inset 2px 2px 3px rgba(0, 0, 0, 0.2);',
        simple: '2px 2px 3px rgba(0, 0, 0, 0.25);',
        simpleInset: 'inset 2px 2px 3px rgba(0, 0, 0, 0.25);',
        illuminate: '0px 0px 2px rgba(255,255,255,0.5);',
        shadowUp: '0px -2px 2px rgba(0, 0, 0, 0.25);',
      },
      colors: {
        design: {
          darkGrey: '#353535',
          sideBar: '#403E3E',
          subtitleGrey: '#807C7C',
          sideBarHeader: '#E0E0E0',
          sideBarText: '#B6B6B6',
          lightGrey: '#DADADA',
          background: '#F6F6F6',
          'rb-100': '#F5F2F2',
          'rb-500': '#524A4A',
          'rb-800': '#262525',
          'rb-900': '#1C1919',
        },
        mbta: {
          red: '#D13434',
          lightRed: '#E89999',
          orange: '#ed8b00',
          lightOrange: '#F6C580',
          blue: '#003da5',
          lightBlue: '#809ED2',
          green: '#00834d',
          lightGreen: '#80C1A6',
          bus: '#ffc72c',
          lightBus: '#FFE395',
        },
        tm: {
          red: '#a31e1e',
          grey: '#2e2d2c',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
