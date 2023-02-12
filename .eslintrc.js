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
    'plugin:import/recommended',
    'next/core-web-vitals',
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
  plugins: ['react', 'react-hooks', '@typescript-eslint', 'import', 'unused-imports', 'prettier'],
  rules: {
    'import/named': 'warn',
    'import/no-unresolved': 'warn',
    'import/no-self-import': 'error',
    'import/no-default-export': 'off',
    'import/order': 'error',
    'prettier/prettier': 'warn',
    'react/prop-types': 'off',
    'react/jsx-no-target-blank': 'off',
    'react/no-unescaped-entities': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'warn',
    'unused-imports/no-unused-imports': 'error',
    'no-console': 'error',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    // TODO: Remove exceptions for src after v4 is done
    {
      files: ['src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx'],
      rules: {
        'import/named': 'off',
        'import/no-unresolved': 'off',
        'prettier/prettier': 'off',
        'react/prop-types': 'off',
        'react/jsx-no-target-blank': 'off',
        'react/no-unescaped-entities': 'off',
        'react-hooks/rules-of-hooks': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react/react-in-jsx-scope': 'off',
        'no-console': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        'import/no-default-export': 'off',
        'import/order': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/consistent-type-imports': ['off'],
      },
    },
    {
      files: ['app/**/*.tsx'],
      rules: {
        'import/no-default-export': 'off',
      },
    },
  ],
};
