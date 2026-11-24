import 'react';

declare module 'react' {
  // Lets inline styles set CSS custom properties.
  interface CSSProperties {
    [property: `--${string}`]: string | number | undefined;
  }
}
