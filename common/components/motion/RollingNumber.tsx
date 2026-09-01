import React, { useEffect, useRef } from 'react';

interface RollingNumberProps {
  /** The target value to display. Roll-up animates from the currently shown value to this. */
  value: number;
  /** Formats the interpolated number for display each frame (units, rounding, compaction). */
  format: (value: number) => string;
  /** Total roll-up travel time. Kept a touch longer than a reveal so the count reads. */
  durationMs?: number;
  className?: string;
}

const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = (): boolean =>
  'window' in globalThis &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

/**
 * A number that rolls to its value when the value *changes* — the scorecard metric ticking to a
 * new figure like a platform countdown clock. It renders the true value on first paint (see the
 * seed below), so the initial arrival does NOT count up from zero: this is a data-integrity
 * surface whose headline numbers get screenshotted for press, and a transient "0 mph" would read
 * as a false figure. Only later in-place changes (a data refetch, a metric/line swap) animate,
 * and every in-between frame then sits between two real values. Snaps straight for reduced motion.
 *
 * The count is written straight to the span's text via a ref, so ~40 frames/roll cost zero React
 * renders. Animates from whatever is currently on screen to `value`, so it survives React's dev
 * Strict-Mode double-invoke and resumes cleanly if `value` changes mid-roll.
 */
export const RollingNumber: React.FC<RollingNumberProps> = ({
  value,
  format,
  durationMs = 650,
  className,
}) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  // Seed at the true value so first paint (and SSR, and any screenshot) shows the real number,
  // never a transient "0". The effect's `from === value` guard then no-ops on mount; only a later
  // change to `value` animates, rolling from the previously shown (real) figure to the new one.
  const currentRef = useRef(value);
  const frameRef = useRef<number>();

  useEffect(() => {
    const node = spanRef.current;
    if (!node) return;

    // Nothing sensible to roll toward — show it as-is (buildRow already drops non-finite rows).
    if (!Number.isFinite(value) || prefersReducedMotion()) {
      currentRef.current = value;
      node.textContent = format(value);
      return;
    }

    const from = currentRef.current;
    if (from === value) {
      node.textContent = format(value);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / durationMs, 1);
      const current = from + (value - from) * easeOutCubic(progress);
      currentRef.current = current;
      node.textContent = format(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        currentRef.current = value;
        node.textContent = format(value);
      }
    };
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, durationMs, format]);

  // First paint (and SSR) shows the starting value; the effect animates from there.
  return (
    <span ref={spanRef} className={className}>
      {format(currentRef.current)}
    </span>
  );
};
