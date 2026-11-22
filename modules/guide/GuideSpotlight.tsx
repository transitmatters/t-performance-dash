import { useEffect, useState } from 'react';
import type { GuideAnchor } from './anchors';
import { findGuideAnchor } from './anchors';

/** How long to wait for the element to render, e.g. after a choice navigates. */
const GIVE_UP_MS = 4000;
const PAD = 4;
/** Room left around the element, so the ring isn't clipped at the edge of the window. */
const MARGIN = 32;

interface Found {
  anchor: GuideAnchor;
  top: number;
  left: number;
  width: number;
  height: number;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Scrolls the element to the middle of the window, unless it's already comfortably in view. */
const bringIntoView = (element: HTMLElement) => {
  const { top, bottom } = element.getBoundingClientRect();
  if (top >= MARGIN && bottom <= window.innerHeight - MARGIN) return;
  element.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
};

/**
 * A ring drawn over the element the guide is talking about. It's an overlay rather than a class
 * on the element, so it never fights the element's own styles, and it follows the element as the
 * page scrolls or the sidebar collapses. Points at nothing if the element isn't on screen.
 */
export const GuideSpotlight = ({ anchor }: { anchor?: GuideAnchor }) => {
  const [found, setFound] = useState<Found | null>(null);

  useEffect(() => {
    if (!anchor) return;
    const started = performance.now();
    let element: HTMLElement | undefined;
    let scrolled = false;
    let frame = 0;

    const tick = () => {
      if (!element?.isConnected) element = findGuideAnchor(anchor);
      if (!element) {
        setFound(null);
        if (performance.now() - started < GIVE_UP_MS) frame = requestAnimationFrame(tick);
        return;
      }
      if (!scrolled) {
        bringIntoView(element);
        scrolled = true;
      }
      const { top, left, width, height } = element.getBoundingClientRect();
      setFound((previous) =>
        previous?.anchor === anchor &&
        previous.top === top &&
        previous.left === left &&
        previous.width === width &&
        previous.height === height
          ? previous
          : { anchor, top, left, width, height }
      );
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [anchor]);

  // A frame left over from the previous node waits until this one's element is found.
  if (!found || found.anchor !== anchor || !found.width || !found.height) return null;

  return (
    <div
      aria-hidden
      className="tm-guide-spotlight pointer-events-none fixed z-40 rounded-xl"
      style={{
        top: found.top - PAD,
        left: found.left - PAD,
        width: found.width + PAD * 2,
        height: found.height + PAD * 2,
      }}
    />
  );
};
