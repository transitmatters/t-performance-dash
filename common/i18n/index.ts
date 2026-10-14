import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { isPseudoLocaleEnabled, pseudoPostProcessor, PSEUDO_LANGUAGE } from './pseudo';
import { defaultNS, resources } from './resources';

// The app's one i18next instance. React components use `useTranslation`; everything else
// (constants, Chart.js callbacks, meta tags) calls `i18n.t`. Changing language reloads the
// page, so a string resolved at module load never goes stale.
export const i18n = i18next.createInstance();

const pseudo = isPseudoLocaleEnabled();

i18n.use(initReactI18next).use(pseudoPostProcessor);

void i18n.init({
  resources,
  defaultNS,
  ns: Object.keys(resources.en),
  lng: 'en',
  fallbackLng: 'en',
  // Resources are bundled, so init can finish before any module reads a string.
  initAsync: false,
  // React already escapes rendered text.
  interpolation: { escapeValue: false },
  postProcess: pseudo ? [PSEUDO_LANGUAGE] : false,
});

if (typeof document !== 'undefined') {
  document.documentElement.lang = i18n.language;
}
