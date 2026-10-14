import type { PostProcessorModule } from 'i18next';

// Dev-only pseudo-locale: every translated string renders accented and bracketed
// ("[Śļöŵ žöñéš]"), so any plain English left on screen is a string that wasn't extracted.
// Turn it on with localStorage.setItem('tm-lng', 'pseudo') and reload.
export const LANGUAGE_STORAGE_KEY = 'tm-lng';
export const PSEUDO_LANGUAGE = 'pseudo';

const PLAIN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ACCENTED = Array.from('áƀçðéƒĝĥíĵķļɱñöþǫŕšţúṽŵẋýžÁƁÇÐÉƑĜĤÍĴĶĻṀÑÖÞǪŔŠŢÚṼŴẊÝŽ');

// Markup that <Trans> parses (`<1>`, `<link>`) and HTML entities must survive untouched.
const PROTECTED = /(<[^>]*>|&\w+;)/;

export const pseudoLocalize = (text: string) =>
  `[${text
    .split(PROTECTED)
    .map((part, i) => (i % 2 ? part : part.replace(/[a-zA-Z]/g, (c) => ACCENTED[PLAIN.indexOf(c)])))
    .join('')}]`;

export const pseudoPostProcessor: PostProcessorModule = {
  type: 'postProcessor',
  name: PSEUDO_LANGUAGE,
  process: (value: string) => pseudoLocalize(value),
};

export const isPseudoLocaleEnabled = () => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === PSEUDO_LANGUAGE;
  } catch {
    return false;
  }
};
