import { defineConfig } from 'oxlint';

export default defineConfig({
  $schema: './node_modules/oxlint/configuration_schema.json',
  // Listing plugins replaces oxlint's defaults, so eslint/typescript/unicorn/oxc are restated here.
  plugins: ['eslint', 'typescript', 'unicorn', 'oxc', 'import', 'react', 'jsx-a11y', 'vitest'],
  categories: {
    correctness: 'error',
    suspicious: 'error',
    perf: 'warn',
  },
  options: {
    typeAware: true,
    // typeCheck is left off: it type-checks with TypeScript 7 (typescript-go), which disagrees with
    // our TypeScript 6 on a few Chart.js generics, and only covers linted files. `tsc` stays the
    // source of truth for type errors.
  },
  env: {
    browser: true,
    node: true,
    es2024: true,
  },
  // *.js and *.mjs: public/maplibre-gl/<version>/*.mjs are vendored, minified copies
  // (scripts/copy-maplibre-worker.js) that postinstall recreates before every CI lint run.
  ignorePatterns: [
    'out/**',
    'storybook-static/**',
    'routeTree.gen.ts',
    'common/types/generated/**',
    '**/*.js',
    '**/*.mjs',
  ],
  rules: {
    'no-console': 'error',
    'no-unused-vars': 'error',
    'prefer-destructuring': ['warn', { array: false, object: true }],
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

    'import/no-self-import': 'error',
    'import/no-default-export': 'warn',
    'import/newline-after-import': 'error',
    'import/max-dependencies': ['warn', { max: 20, ignoreTypeImports: false }],

    'react/jsx-no-target-blank': 'warn',
    // Render props (fallbackRender, label `content`) are called, not mounted.
    'react/no-unstable-nested-components': ['error', { allowAsProps: true }],
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    // React Compiler rules; native in oxlint but marked experimental upstream.
    'react/set-state-in-effect': 'error',
    'react/set-state-in-render': 'error',
    'react/immutability': 'error',
    'react/refs': 'error',
    'react/static-components': 'error',
    'react/preserve-manual-memoization': 'error',
    'react/purity': 'error',
    'react/globals': 'error',
    'react/use-memo': 'error',
    'react/void-use-memo': 'error',
    'react/incompatible-library': 'error',
    'react/error-boundaries': 'error',
    'react/unsupported-syntax': 'error',

    'typescript/ban-ts-comment': 'error',
    'typescript/no-explicit-any': 'error',
    'typescript/no-non-null-assertion': 'off',
    'typescript/triple-slash-reference': 'off',
    'typescript/consistent-type-imports': [
      'error',
      { prefer: 'type-imports', disallowTypeAnnotations: false },
    ],

    // Type-aware
    'typescript/await-thenable': 'error',
    'typescript/no-floating-promises': 'error',
    'typescript/no-misused-promises': 'error',
    'typescript/no-unnecessary-type-assertion': 'error',
    'typescript/no-unsafe-argument': 'error',
    'typescript/no-unsafe-assignment': 'error',
    'typescript/no-unsafe-call': 'error',
    'typescript/no-unsafe-member-access': 'error',
    'typescript/no-unsafe-return': 'error',
    // On primitives `||` is used on purpose: '' falls back to a default, 0 hides a value, and
    // booleans are or'd. `??` would change all three. Not on by category (pedantic).
    'typescript/prefer-nullish-coalescing': [
      'error',
      { ignorePrimitives: true, ignoreBooleanCoercion: true },
    ],
    'typescript/restrict-template-expressions': 'error',
    'typescript/switch-exhaustiveness-check': [
      'error',
      { considerDefaultExhaustiveForUnions: true, requireDefaultForNonUnion: false },
    ],

    // Not useful here
    'react/react-in-jsx-scope': 'off', // automatic JSX runtime
    'import/no-unassigned-import': 'off', // CSS side-effect imports
    'unicorn/consistent-function-scoping': 'off',
    'oxc/no-map-spread': 'off',
    'unicorn/prefer-set-has': 'off', // its fixes turn tiny constant arrays into Sets, one by one
    'eslint/no-underscore-dangle': 'off', // Chart.js and TanStack Router expose `_`-prefixed fields
    'react/exhaustive-effect-dependencies': 'off', // duplicates react/exhaustive-deps
    'jsx-a11y/control-has-associated-label': 'off', // flags empty table cells
    // Wants <img> for role="img" on chart canvases and <fieldset> for role="group" divs.
    'jsx-a11y/prefer-tag-over-role': 'off',
    'vitest/valid-expect': 'off', // flags Vitest's expect(value, message) form
    'vitest/require-mock-type-parameters': 'off',
    'vitest/require-to-throw-message': 'off',

    // Worth turning on, but each has too many existing violations for this change.
    // Counts are as of the switch to oxlint.
    'typescript/consistent-type-assertions': 'off', // 266; target { assertionStyle: 'never' }
    'typescript/no-unsafe-type-assertion': 'off', // 204
    // These three trust indexed access to always return a value, so they need
    // noUncheckedIndexedAccess on first or their fixes drop real undefined guards.
    'typescript/no-unnecessary-condition': 'off', // 217
    'typescript/no-unnecessary-type-conversion': 'off', // 10
    'typescript/no-unnecessary-boolean-literal-compare': 'off', // 2
  },
  overrides: [
    {
      // The wrappers behind the @chartjs-* and @lodash-utils aliases
      files: [
        'common/components/charts/chartjs.ts',
        'common/utils/chartjs.ts',
        'common/utils/setupCharts.ts',
        'common/utils/lodash.ts',
      ],
      rules: { 'no-restricted-imports': 'off' },
    },
    {
      files: ['**/*.stories.tsx', 'vite.config.ts', 'oxlint.config.ts'],
      rules: { 'import/no-default-export': 'off' },
    },
    {
      files: ['common/styles/*.ts', 'common/constants/**/*.ts', 'common/types/**/*.ts'],
      rules: { 'typescript/no-non-null-assertion': 'error' },
    },
    {
      // Asymmetric matchers (expect.closeTo and friends) are typed `any`, and test doubles stand in
      // for class instances.
      files: ['**/*.test.ts', '**/*.test.tsx'],
      rules: {
        'typescript/no-unsafe-assignment': 'off',
        'typescript/no-unsafe-class-instance-assignment': 'off',
      },
    },
    {
      // shadcn/ui components are generated by its CLI; keep them close to upstream.
      files: ['common/components/ui/**/*.tsx'],
      rules: {
        'eslint/no-shadow': 'off',
        'import/max-dependencies': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'jsx-a11y/no-noninteractive-element-interactions': 'off',
        'react/jsx-no-constructed-context-values': 'off',
        'react/no-unstable-nested-components': 'off',
      },
    },
  ],
});
