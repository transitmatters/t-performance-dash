import type { DisplayStyle } from './types';

export const defaultStyle: DisplayStyle = {
  color: 'black',
  borderWidth: 0,
  opacity: 1,
};

export const resolveStyle = (styles: (null | Partial<DisplayStyle>)[]): DisplayStyle => {
  return styles.reduce((a, b) => ({ ...a, ...b }), defaultStyle) as DisplayStyle;
};
