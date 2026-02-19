import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import unusedImports from 'eslint-plugin-unused-imports';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default typescriptEslint.config(
  // Global ignores
  {
    ignores: ['node_modules/**/*', 'build/**/*', 'out/**/*', '.next/**/*', '**/*.js'],
  },

  // Base configs
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,
  ...compat.extends('next/core-web-vitals'),
  eslintConfigPrettier,

  // Main config
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'import-x': importX,
      react,
      'react-hooks': reactHooks,
      'unused-imports': unusedImports,
      prettier,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.amd,
        ...globals.node,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },
      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
        project: true,
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import-x/named': 'warn',
      'import-x/no-unresolved': 'warn',
      'import-x/no-self-import': 'error',
      'import-x/no-default-export': 'warn',
      'import-x/order': 'error',
      'import-x/newline-after-import': 'error',
      // import-x/no-unused-modules is incompatible with flat config
      // See: https://github.com/un-ts/eslint-plugin-import-x/issues/75
      'import-x/no-useless-path-segments': [
        'error',
        {
          noUselessIndex: true,
        },
      ],
      'import-x/max-dependencies': [
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
  },

  // Override: stories, pages, middleware — allow default exports
  {
    files: ['**/*.stories.tsx', 'pages/**/*.tsx', 'middleware.ts'],
    rules: {
      'import-x/no-default-export': 'off',
    },
  },

  // Override: types and constants
  {
    files: ['common/styles/*.ts', 'common/constants/**/*.ts', 'common/types/**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
);
