import commute from '../../locales/en/commute.json';
import common from '../../locales/en/common.json';
import dashboard from '../../locales/en/dashboard.json';
import home from '../../locales/en/home.json';
import landing from '../../locales/en/landing.json';
import navigation from '../../locales/en/navigation.json';

// English is the source language: its catalogs are bundled so i18n initialises synchronously
// (in the browser, vitest, Storybook and the build-time meta-tag prerender alike).
// Register each new namespace (locales/en/<namespace>.json) here.
export const defaultNS = 'common';

export const resources = {
  en: { common, commute, dashboard, home, landing, navigation },
};
