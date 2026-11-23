import forms from '@tailwindcss/forms';
import { BREAKPOINTS } from './common/constants/breakpoints.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./common/**/*.{js,ts,jsx,tsx}', './modules/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    screens: BREAKPOINTS,
    fontFamily: {
      display: ['Helvetica Neue', 'sans-serif'],
    },
    extend: {
      animation: {
        'star-movement-bottom': 'star-movement-bottom linear infinite alternate',
        'star-movement-top': 'star-movement-top linear infinite alternate',
      },
      keyframes: {
        'star-movement-bottom': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(-100%, 0%)', opacity: '0' },
        },
        'star-movement-top': {
          '0%': { transform: 'translate(0%, 0%)', opacity: '1' },
          '100%': { transform: 'translate(100%, 0%)', opacity: '0' },
        },
      },
      boxShadow: {
        dataBox: '1px 1px 4px rgba(0, 0, 0, 0.1);',
      },
      colors: {
        design: {
          subtitleGrey: '#807C7C',
        },
        // Red, orange and green are CSS variables so colorblind mode can shift them (globals.css).
        mbta: {
          red: 'var(--mbta-red)',
          lightRed: 'var(--mbta-light-red)',
          darkRed: 'var(--mbta-dark-red)',
          orange: 'var(--mbta-orange)',
          lightOrange: 'var(--mbta-light-orange)',
          darkOrange: 'var(--mbta-dark-orange)',
          blue: '#003da5',
          lightBlue: '#809ED2',
          darkBlue: '#19376B',
          green: 'var(--mbta-green)',
          lightGreen: 'var(--mbta-light-green)',
          darkGreen: 'var(--mbta-dark-green)',
          bus: '#f5B400',
          lightBus: '#FFE395',
          darkBus: '#E6A800',
          commuterRail: '#80276c',
          lightCommuterRail: '#942d7c',
          darkCommuterRail: '#6c215c',
          ferry: '#008EAA',
          lightFerry: '#80C7D7',
          darkFerry: '#006B82',
          silver: '#7C878E',
        },
        tm: {
          red: '#a31e1e',
          grey: '#2e2d2c',
          lightGrey: '#3E3E3E',
        },
      },
    },
  },
  plugins: [forms],
};
