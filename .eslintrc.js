module.exports = {
  env: {
    browser: true,
    es6: true,
    amd: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'import', 'prettier'],
  rules: {
    'prettier/prettier': 'off', // TODO: Change to Warn
    'react/prop-types': 'off', // TODO: Turn on or move to TS
    'react/jsx-no-target-blank': 0,
    'react/no-unescaped-entities': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'off',
    'no-console': 'off',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'import/no-default-export': 'warn',
    'import/order': 'off',
    '@typescript-eslint/no-explicit-any': 'off', // TODO: Turn on when TS migration done
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
};
