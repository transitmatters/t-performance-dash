import { defineConfig } from 'i18next-cli';

// Keeps locales/en in sync with the keys the code uses. English values are written by hand;
// `npm run i18n:extract` adds newly used keys and drops unused ones, and `npm run i18n:check`
// (part of lint-frontend) fails when the catalogs and the code disagree.
export default defineConfig({
  locales: ['en'],
  extract: {
    input: ['{common,modules,routes}/**/*.{ts,tsx}'],
    ignore: ['**/*.test.ts', '**/*.stories.tsx'],
    output: 'locales/{{language}}/{{namespace}}.json',
    defaultNS: 'common',
    extractFromComments: false,
    // Keep keys in the order they were written, grouped the way the UI is.
    sort: false,
    indentation: 2,
  },
});
