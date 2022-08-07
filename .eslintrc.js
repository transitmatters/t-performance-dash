module.exports = {
  env: {
    browser: true,
    es6: true,
    amd: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended", "prettier"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["react", "react-hooks", "prettier"],
  rules: {
    "prettier/prettier": "off", // TODO: Change to Warn
    "react/prop-types": "off", // TODO: Turn on or move to TS
    "react/no-unescaped-entities": "off",
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
