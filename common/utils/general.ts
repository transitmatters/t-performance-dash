export const hexWithAlpha = (hexColor: string, alpha: number) => {
  const opacity = Math.round(Math.min(Math.max(alpha || 1, 0), 1) * 255);
  return hexColor + opacity.toString(16).toUpperCase();
};

const relativeLuminance = (hexColor: string): number => {
  const hex = hexColor.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const linearize = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  const [rl, gl, bl] = [r, g, b].map(linearize);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
};

const contrastRatio = (hexA: string, hexB: string): number => {
  const [lA, lB] = [relativeLuminance(hexA), relativeLuminance(hexB)];
  const [lighter, darker] = lA > lB ? [lA, lB] : [lB, lA];
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Picks a readable foreground for a solid line color. The MBTA palette spans very dark (Blue Line)
 * to very light (bus yellow), so a fixed white foreground fails on the bright end. Picking by WCAG
 * contrast against each candidate (rather than a fixed brightness cutoff) avoids misclassifying
 * colors that sit right at a threshold, like the darker orange shade used for button backgrounds.
 */
export const readableOn = (hexColor: string): 'light' | 'dark' =>
  contrastRatio(hexColor, '#ffffff') >= contrastRatio(hexColor, '#1c1917') ? 'light' : 'dark';
