// Dev-only pseudo-locale: every catalog string renders accented and bracketed ("[Śļöŵ žöñéš]"),
// so any plain English left on screen wasn't extracted. Interpolated values (station names, numbers)
// stay plain, since only the catalog is transformed. Turn it on with
// localStorage.setItem('tm-lng', 'pseudo') and reload.
export const LANGUAGE_STORAGE_KEY = 'tm-lng';
export const PSEUDO_LANGUAGE = 'pseudo';

const PLAIN = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const ACCENTED = Array.from('áƀçðéƒĝĥíĵķļɱñöþǫŕšţúṽŵẋýžÁƁÇÐÉƑĜĤÍĴĶĻṀÑÖÞǪŔŠŢÚṼŴẊÝŽ');

// Placeholders, <Trans> markup (`<link>`, `<1>`) and HTML entities must survive untouched.
const PROTECTED = /(\{\{[^}]*\}\}|<[^>]*>|&\w+;)/;

export const pseudoLocalize = (text: string) =>
  `[${text
    .split(PROTECTED)
    .map((part, i) => (i % 2 ? part : part.replace(/[a-zA-Z]/g, (c) => ACCENTED[PLAIN.indexOf(c)])))
    .join('')}]`;

type Catalog = { [key: string]: string | Catalog };

export const pseudoLocalizeCatalog = (catalog: Catalog): Catalog =>
  Object.fromEntries(
    Object.entries(catalog).map(([key, value]) => [
      key,
      typeof value === 'string' ? pseudoLocalize(value) : pseudoLocalizeCatalog(value),
    ])
  );

export const isPseudoLocaleEnabled = () => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === PSEUDO_LANGUAGE;
  } catch {
    return false;
  }
};
