const { defineConfig, globalIgnores } = require('eslint/config');

const globals = require('globals');

const { fixupConfigRules, fixupPluginRules } = require('@eslint/compat');

const tsParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const _import = require('eslint-plugin-import');
const unusedImports = require('eslint-plugin-unused-imports');
const prettier = require('eslint-plugin-prettier');
const unicorn = require('eslint-plugin-unicorn');
const js = require('@eslint/js');

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

module.exports = defineConfig([
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.amd,
        ...globals.node,
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
      },

      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',

      parserOptions: {
        warnOnUnsupportedTypeScriptVersion: false,
        project: true,

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:import/recommended',
        'next/core-web-vitals',
        'prettier',
        'plugin:storybook/recommended'
      )
    ),

    plugins: {
      react: fixupPluginRules(react),
      'react-hooks': fixupPluginRules(reactHooks),
      '@typescript-eslint': fixupPluginRules(typescriptEslint),
      import: fixupPluginRules(_import),
      'unused-imports': unusedImports,
      prettier,
      unicorn,
    },

    rules: {
      'import/named': 'warn',
      'import/no-unresolved': 'warn',
      'import/no-self-import': 'error',
      'import/no-default-export': 'warn',
      'import/order': 'error',
      'import/newline-after-import': 'error',

      'import/no-unused-modules': [
        'warn',
        {
          unusedExports: true,
        },
      ],

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
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',

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
  },
  {
    files: ['**/*.stories.tsx', 'pages/**/*.tsx', '**/middleware.ts'],

    rules: {
      'import/no-default-export': 'off',

      'import/no-unused-modules': [
        'off',
        {
          unusedExports: false,
        },
      ],
    },
  },
  {
    files: ['common/styles/*.ts', 'common/constants/**/*.ts', 'common/types/**/*.ts'],

    rules: {
      '@typescript-eslint/no-non-null-assertion': 'error',

      'import/no-unused-modules': [
        'off',
        {
          unusedExports: false,
        },
      ],
    },
  },
  globalIgnores(['node_modules/**/*', 'build/**/*', 'out/**/*', '**/*.js']),
]);
