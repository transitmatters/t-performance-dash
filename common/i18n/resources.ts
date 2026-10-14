import common from '../../locales/en/common.json';

// English is the source language: its catalogs are bundled so i18n initialises synchronously
// (in the browser, vitest, Storybook and the build-time meta-tag prerender alike).
// Register each new namespace (locales/en/<namespace>.json) here.
export const defaultNS = 'common';

export const resources = {
  en: { common },
};
