/**
 * The system font stack, matching `--font-sans` in styles/globals.css. Charts draw on a canvas,
 * which doesn't inherit CSS fonts, so they read it from here.
 */
export const FONT_SANS =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

/** The label role (DESIGN.md): the smallest text anywhere, chart ticks and annotations included. */
export const LABEL_FONT_SIZE = 12;
