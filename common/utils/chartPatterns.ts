import type { CSSProperties } from 'react';
import { hexWithAlpha, readableOn } from './general';

export type PatternShape = 'solid' | 'diagonal' | 'dots' | 'crosshatch' | 'horizontal' | 'vertical';

// CSS pixels per repeat
const TILE = 10;

const cache = new Map<string, CanvasPattern | string>();

/** The texture's ink: dark on light fills, light on dark ones. */
const inkOn = (color: string) =>
  readableOn(color) === 'dark' ? 'rgba(28,25,23,0.5)' : 'rgba(255,255,255,0.65)';

const drawShape = (ctx: CanvasRenderingContext2D, shape: PatternShape, size: number) => {
  const stroke = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };
  // Each diagonal is drawn again a tile over on both sides so the stripes meet across tile edges
  const diagonal = (flip: boolean) =>
    [-size, 0, size].forEach((offset) =>
      flip ? stroke(offset, 0, offset + size, size) : stroke(offset, size, offset + size, 0)
    );
  if (shape === 'diagonal') diagonal(false);
  if (shape === 'crosshatch') {
    diagonal(false);
    diagonal(true);
  }
  if (shape === 'horizontal') stroke(0, size / 2, size, size / 2);
  if (shape === 'vertical') stroke(size / 2, 0, size / 2, size);
  if (shape === 'dots') {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.17, 0, Math.PI * 2);
    ctx.fill();
  }
};

/**
 * A Chart.js fill: the color with a texture over it, so categories stay apart when their colors
 * don't. `color` is a 6-digit hex; `alpha` fades the whole fill, e.g. for a dimmed bar.
 */
export const patternFill = (
  color: string,
  shape: PatternShape,
  alpha = 1
): CanvasPattern | string => {
  if (shape === 'solid' || typeof document === 'undefined') {
    return alpha < 1 ? hexWithAlpha(color, alpha) : color;
  }
  const ratio = Math.max(1, Math.round(window.devicePixelRatio || 1));
  const key = `${color}|${shape}|${alpha}|${ratio}`;
  const cached = cache.get(key);
  if (cached) return cached;

  // Drawn at device resolution, then scaled back down, so the texture stays crisp on HiDPI screens
  const size = TILE * ratio;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return color;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, size, size);
  const ink = inkOn(color);
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineWidth = 1.5 * ratio;
  drawShape(ctx, shape, size);

  const pattern = ctx.createPattern(canvas, 'repeat');
  if (!pattern) return color;
  pattern.setTransform(new DOMMatrix().scale(1 / ratio));
  cache.set(key, pattern);
  return pattern;
};

/**
 * The same textures as patternFill, as CSS for HTML elements. `tile` is the repeat in CSS pixels;
 * pass a smaller one for a legend swatch so the texture still shows at that size.
 */
export const patternStyle = (color: string, shape: PatternShape, tile = TILE): CSSProperties => {
  if (shape === 'solid') return { backgroundColor: color };
  const ink = inkOn(color);
  const width = Math.max(1, tile * 0.15);
  const lines = (angle: number, spacing = tile) =>
    `repeating-linear-gradient(${angle}deg, ${ink} 0 ${width}px, transparent ${width}px ${spacing}px)`;
  const diagonalSpacing = tile / Math.SQRT2;
  const images: Record<Exclude<PatternShape, 'solid'>, string> = {
    diagonal: lines(-45, diagonalSpacing),
    crosshatch: `${lines(-45, diagonalSpacing)}, ${lines(45, diagonalSpacing)}`,
    horizontal: lines(0),
    vertical: lines(90),
    dots: `radial-gradient(circle, ${ink} ${tile * 0.17}px, transparent ${tile * 0.17 + 0.5}px)`,
  };
  return {
    backgroundColor: color,
    backgroundImage: images[shape],
    ...(shape === 'dots' && { backgroundSize: `${tile}px ${tile}px` }),
  };
};
