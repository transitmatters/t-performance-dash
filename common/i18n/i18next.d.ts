import type { defaultNS, resources } from './resources';

// Types t() keys against the English catalogs, so a typo or missing key fails `tsc`.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    resources: (typeof resources)['en'];
  }
}
