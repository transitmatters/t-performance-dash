import type { Line } from './lines';

export type StyleMap = { [key in Line]: string };

export type DefaultStyleMap = { [key in Line | 'DEFAULT']: string };
