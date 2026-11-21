import type { Line, LineColorKey } from './lines';

export type StyleMap = { [key in Line]: string };

/** A style map that also covers the Silver Line's own color. */
export type LineColorStyleMap = { [key in LineColorKey | 'DEFAULT']: string };
