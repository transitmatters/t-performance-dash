const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './common/**/*.{js,ts,jsx,tsx}',
    './modules/**/*.{js,ts,jsx,tsx}',
    './node_modules/react-tailwindcss-datepicker/dist/index.esm.js',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}',
  ],
  safelist: [
    {
      pattern:
        /(border|text|bg)-mbta-(red|lightRed|orange|lightOrange|blue|lightBlue|green|lightGreen|bus|lightBus)/,
    },
  ],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
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
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
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
          darkRed: '#bc2020',
          orange: '#ed8b00',
          lightOrange: '#F6C580',
          darkOrange: '#e08300',
          blue: '#003da5',
          lightBlue: '#809ED2',
          darkBlue: '#19376B',
          green: '#00834d',
          lightGreen: '#80C1A6',
          darkGreen: '#0E5E3D',
          bus: '#f5B400',
          lightBus: '#FFE395',
          darkBus: '#E6A800',
          commuterRail: '#80276c',
          lightCommuterRail: '#942d7c',
          darkCommuterRail: '#6c215c',
        },
        tm: {
          red: '#a31e1e',
          grey: '#2e2d2c',
          lightGrey: '#3E3E3E',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('flowbite/plugin'),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') }
      );
    }),
  ],
};
