import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { i18n } from '.';

// Locale-aware formatting. Use these instead of hard-coding 'en-US' so numbers, lists and
// chart dates follow the UI language once more languages are added.
const INTL_LOCALES: Record<string, string> = { en: 'en-US' };
const DATE_FNS_LOCALES: Record<string, Locale> = { en: enUS };

const language = () => i18n.resolvedLanguage ?? 'en';

/** BCP 47 locale for `Intl` APIs. */
export const getLocale = () => INTL_LOCALES[language()] ?? INTL_LOCALES.en;

/** date-fns locale, for the Chart.js time-axis adapter. */
export const getDateFnsLocale = () => DATE_FNS_LOCALES[language()] ?? enUS;

export const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat(getLocale(), options).format(value);

/** "a, b, and c" in the UI language. */
export const formatList = (items: string[], type: Intl.ListFormatType = 'conjunction') =>
  new Intl.ListFormat(getLocale(), { style: 'long', type }).format(items);
