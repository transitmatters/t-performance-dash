/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    'border-mbta-green',
    'text-mbta-green',
    { pattern: /(border|text)-mbta-(red|lightRed|orange|blue|green|bus)/ },
  ],
  theme: {
    fontSize: {
      // TODO: try using only defaults.
      xs: '0.5rem',
      sm: '0.75rem',
      base: '1rem',
      xl: '1.25rem',
      '2xl': '1.563rem',
      '3xl': '1.875rem',
      '4xl': '2.5rem',
      '5xl': '3.052rem',
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
          subtitleGrey: '#808080',
          lightGrey: '#DADADA',
          background: '#F6F6F6',
        },
        mbta: {
          red: '#D13434',
          lighterRed: '#EEA7A3',
          lightRed: '#ea6359',
          orange: '#ed8b00',
          blue: '#003da5',
          green: '#00834d',
          bus: '#ffc72c',
        },
        tm: {
          red: '#a31e1e',
          lightRed: '#cb2525',
          grey: '#2e2d2c',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
