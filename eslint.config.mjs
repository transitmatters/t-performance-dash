import js from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import importX from 'eslint-plugin-import-x';
import reactDom from 'eslint-plugin-react-dom';
import reactHooks from 'eslint-plugin-react-hooks';
import reactX from 'eslint-plugin-react-x';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

export default typescriptEslint.config(
  // Global ignores
  {
    // *.mjs alongside *.js: public/maplibre-gl/<version>/*.mjs are vendored,
    // minified copies (scripts/copy-maplibre-worker.js), not source -- and postinstall
    // recreates them before every CI lint run, not just in a local checkout.
    ignores: [
      'node_modules/**/*',
      'build/**/*',
      'out/**/*',
      'storybook-static/**/*',
      'routeTree.gen.ts',
      '**/*.js',
      '**/*.mjs',
    ],
  },

  // Base configs
  js.configs.recommended,
  ...typescriptEslint.configs.recommended,

  // Main config
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      'import-x': importX,
      'react-dom': reactDom,
      'react-hooks': reactHooks,
      'react-x': reactX,
      'unused-imports': unusedImports,
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
      'import-x/resolver': {
        typescript: true,
      },
    },
    rules: {
      'import-x/named': 'warn',
      'import-x/no-unresolved': 'warn',
      'import-x/no-self-import': 'error',
      'import-x/no-default-export': 'warn',
      'import-x/order': [
        'error',
        {
          // tsconfig path aliases that stand in for packages; they sort with the package imports.
          pathGroups: [
            { pattern: '@{chartjs-components,chartjs-utils,lodash-utils}', group: 'external' },
          ],
        },
      ],
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
      'react-dom/no-unsafe-target-blank': 'warn',
      // Props declared in a component's props type but never read. Uses type information and is
      // marked experimental upstream, so it may change between eslint-react releases.
      'react-x/no-unused-props': 'warn',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/set-state-in-effect': 'error',
      'react-hooks/immutability': 'error',
      'react-hooks/refs': 'error',
      'react-hooks/static-components': 'error',
      'react-hooks/preserve-manual-memoization': 'error',
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
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'chart.js', message: "Import from '@chartjs-utils'.", allowTypeImports: true },
            { name: 'react-chartjs-2', message: "Import from '@chartjs-components'." },
            { name: 'lodash', message: "Import from '@lodash-utils'." },
          ],
          patterns: [{ group: ['lodash/*'], message: "Import from '@lodash-utils'." }],
        },
      ],
    },
  },

  // Override: the wrappers behind the @chartjs-* and @lodash-utils aliases
  {
    files: [
      'common/components/charts/chartjs.ts',
      'common/utils/chartjs.ts',
      'common/utils/setupCharts.ts',
      'common/utils/lodash.ts',
    ],
    rules: {
      'no-restricted-imports': 'off',
    },
  },

  // Override: stories and tool configs — allow default exports
  {
    files: ['**/*.stories.tsx', 'vite.config.ts'],
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

  // Override: shadcn/ui components are generated by the CLI and re-generated on update.
  // Keep them close to upstream rather than hand-editing them to satisfy repo style.
  {
    files: ['common/components/ui/**/*.tsx'],
    rules: {
      'import-x/max-dependencies': 'off',
    },
  }
);
