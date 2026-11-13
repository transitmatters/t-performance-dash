/**
 * Computed styles copied onto every element of the SVG copy. The copy is drawn as a standalone
 * image, outside the page's stylesheets, so anything set by a class or inherited from the page
 * (the theme's text color behind `currentColor`, the map's font) would otherwise be lost.
 */
const INLINED_STYLES = [
  'color',
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'opacity',
  'visibility',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
  'dominant-baseline',
] as const;

const inlineStyles = (source: Element, copy: Element) => {
  const computed = getComputedStyle(source);
  copy.setAttribute(
    'style',
    INLINED_STYLES.map((name) => `${name}:${computed.getPropertyValue(name)}`).join(';')
  );
  Array.from(source.children).forEach((child, index) => inlineStyles(child, copy.children[index]));
};

/** The opacity an element is drawn at, after its ancestors' up to `root`. */
const effectiveOpacity = (element: Element, root: Element) => {
  let opacity = 1;
  for (let node: Element | null = element; node && node !== root.parentElement;) {
    opacity *= Number(getComputedStyle(node).opacity);
    node = node.parentElement;
  }
  return opacity;
};

/** The largest SVG in the container: the chart, not an icon or a tooltip's glyph. */
const largestSvg = (container: Element) =>
  Array.from(container.querySelectorAll('svg')).reduce<SVGSVGElement | null>((largest, svg) => {
    const area = (box: DOMRect) => box.width * box.height;
    return !largest || area(svg.getBoundingClientRect()) > area(largest.getBoundingClientRect())
      ? svg
      : largest;
  }, null);

/**
 * Draws an SVG chart (the stripmap line maps) into a canvas at the screen's pixel ratio, so it
 * can be saved as a PNG the way a Chart.js chart is. Images laid over the SVG, such as the
 * map's watermark, are drawn on top where they sit on screen.
 */
export async function svgToCanvas(container: HTMLElement): Promise<HTMLCanvasElement | null> {
  const svg = largestSvg(container);
  if (!svg) return null;
  const box = svg.getBoundingClientRect();
  if (!box.width || !box.height) return null;

  const copy = svg.cloneNode(true) as SVGSVGElement;
  inlineStyles(svg, copy);
  copy.setAttribute('width', String(box.width));
  copy.setAttribute('height', String(box.height));
  const image = new Image();
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    new XMLSerializer().serializeToString(copy)
  )}`;
  await image.decode();

  // Overlays can sit outside the SVG, e.g. a phone's narrow map is centred but its watermark
  // keeps to the container's corner, so the canvas covers them too
  const overlays = Array.from(container.querySelectorAll('img'))
    .map((overlay) => ({ overlay, rect: overlay.getBoundingClientRect() }))
    .filter(({ overlay, rect }) => overlay.complete && rect.width > 0);
  const rects = [box, ...overlays.map(({ rect }) => rect)];
  const left = Math.min(...rects.map((rect) => rect.left));
  const top = Math.min(...rects.map((rect) => rect.top));
  const width = Math.max(...rects.map((rect) => rect.right)) - left;
  const height = Math.max(...rects.map((rect) => rect.bottom)) - top;

  const dpr = window.devicePixelRatio || 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);
  ctx.drawImage(image, box.left - left, box.top - top, box.width, box.height);
  overlays.forEach(({ overlay, rect }) => {
    ctx.globalAlpha = effectiveOpacity(overlay, container);
    ctx.drawImage(overlay, rect.left - left, rect.top - top, rect.width, rect.height);
  });
  ctx.globalAlpha = 1;
  return canvas;
}
