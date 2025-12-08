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
    'plugin:storybook/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
    project: true,
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'import',
    'unused-imports',
    'prettier',
    'unicorn',
  ],
  rules: {
    'import/named': 'warn',
    'import/no-unresolved': 'warn',
    'import/no-self-import': 'error',
    'import/no-default-export': 'warn',
    'import/order': 'error',
    'import/newline-after-import': 'error',
    'import/no-unused-modules': ['warn', { unusedExports: true }],
    'import/no-useless-path-segments': [
      'error',
      {
        noUselessIndex: true,
      },
    ],
    'import/max-dependencies': [
      'warn',
      {
        max: 20,
        ignoreTypeImports: false,
      },
    ],
    'prettier/prettier': 'error',
    'react/prop-types': 'warn',
    'react/jsx-no-target-blank': 'warn',
    'react/no-unescaped-entities': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'error',
    'react/no-unused-prop-types': 'warn',
    'unused-imports/no-unused-imports': 'error',
    'no-console': 'error',
    'no-empty': 'error',
    'unicorn/no-empty-file': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/triple-slash-reference': 'off',
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: false,
      },
    ],
    'prefer-destructuring': [
      'warn',
      {
        array: false,
        object: true,
      },
    ],
    eqeqeq: ['error', 'smart'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  overrides: [
    {
      files: ['**/*.stories.tsx', 'pages/**/*.tsx', 'middleware.ts'],
      rules: {
        'import/no-default-export': 'off',
        'import/no-unused-modules': ['off', { unusedExports: false }],
      },
    },
    // Temporarily don't enforce some rules on types and constants
    {
      files: ['common/styles/*.ts', 'common/constants/**/*.ts', 'common/types/**/*.ts'],
      rules: {
        '@typescript-eslint/no-non-null-assertion': 'error',
        'import/no-unused-modules': ['off', { unusedExports: false }],
      },
    },
  ],
  ignorePatterns: ['node_modules/**/*', 'build/**/*', 'out/**/*', '*.js'],
};
