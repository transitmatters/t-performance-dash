import type { HoverCard } from './hoverCardStore';

const GAP = 12;
const EDGE = 8;

interface Size {
  width: number;
  height: number;
}

export interface Rect extends Size {
  left: number;
  top: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height;

/**
 * Where a card sits in the viewport: centered above its anchor, or beside it on whichever side
 * fits. A side card that would cover `avoid` (another open card) moves below it, then above it,
 * then to the point's other side, taking the first spot that's clear.
 */
export const placeCard = (
  card: Pick<HoverCard, 'x' | 'y' | 'placement'>,
  size: Size,
  viewport: Size,
  avoid?: Rect
): Rect => {
  const { width, height } = size;
  const fit = (left: number, top: number): Rect => ({
    left: Math.round(clamp(left, EDGE, viewport.width - width - EDGE)),
    top: Math.round(clamp(top, EDGE, viewport.height - height - EDGE)),
    width,
    height,
  });

  if (card.placement === 'above') return fit(card.x - width / 2, card.y - height - GAP / 2);

  const right = card.x + GAP;
  const left = card.x - GAP - width;
  const side = right + width > viewport.width - EDGE ? left : right;
  const otherSide = side === right ? left : right;
  const centered = card.y - height / 2;
  const preferred = fit(side, centered);
  if (!avoid || !overlaps(preferred, avoid)) return preferred;

  const alternatives = [
    fit(side, avoid.top + avoid.height + GAP / 2),
    fit(side, avoid.top - height - GAP / 2),
    fit(otherSide, centered),
  ];
  return alternatives.find((rect) => !overlaps(rect, avoid)) ?? preferred;
};
