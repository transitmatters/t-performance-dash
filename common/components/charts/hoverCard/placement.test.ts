import { describe, expect, it } from 'vitest';

import { placeCard } from './placement';
import type { Rect } from './placement';

const viewport = { width: 1200, height: 800 };
const size = { width: 200, height: 100 };

const overlaps = (a: Rect, b: Rect) =>
  a.left < b.left + b.width &&
  b.left < a.left + a.width &&
  a.top < b.top + b.height &&
  b.top < a.top + a.height;

describe('placeCard', () => {
  it('centers an annotation card above its anchor', () => {
    expect(placeCard({ x: 500, y: 300, placement: 'above' }, size, viewport)).toMatchObject({
      left: 400,
      top: 194,
    });
  });

  it('puts a point card to the right, or to the left when it would run off screen', () => {
    expect(placeCard({ x: 500, y: 300, placement: 'side' }, size, viewport)).toMatchObject({
      left: 512,
      top: 250,
    });
    expect(placeCard({ x: 1100, y: 300, placement: 'side' }, size, viewport)).toMatchObject({
      left: 888,
      top: 250,
    });
  });

  it('keeps cards inside the viewport', () => {
    expect(placeCard({ x: 500, y: 10, placement: 'side' }, size, viewport)).toMatchObject({
      top: 8,
    });
  });

  it('leaves a point card alone when it clears the other card', () => {
    const avoid = { left: 0, top: 0, width: 100, height: 100 };
    expect(placeCard({ x: 500, y: 300, placement: 'side' }, size, viewport, avoid)).toMatchObject({
      left: 512,
      top: 250,
    });
  });

  it('moves a point card below an annotation card it would cover', () => {
    const avoid = placeCard({ x: 560, y: 300, placement: 'above' }, size, viewport);
    const rect = placeCard({ x: 500, y: 280, placement: 'side' }, size, viewport, avoid);
    expect(overlaps(rect, avoid)).toBe(false);
    expect(rect.left).toBe(512);
    expect(rect.top).toBe(avoid.top + avoid.height + 6);
  });

  it('moves a point card above when there is no room below', () => {
    const tall = { width: 200, height: 300 };
    const avoid = { left: 450, top: 450, width: 300, height: 300 };
    const rect = placeCard({ x: 500, y: 500, placement: 'side' }, tall, viewport, avoid);
    expect(overlaps(rect, avoid)).toBe(false);
    expect(rect.top + rect.height).toBeLessThanOrEqual(avoid.top);
  });
});
