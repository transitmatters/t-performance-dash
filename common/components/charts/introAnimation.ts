import { useEffect, useState } from 'react';
import type { ChartOptions, ScriptableContext } from 'chart.js';

/** How long the whole series takes to draw in. */
const DURATION_MS = 2400;

const prefersReducedMotion = () =>
  'window' in globalThis && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Chart.js's progressive line: each point lands in turn, left to right, so a day's series draws
 * itself in time order. Each point grows out of the one before it.
 */
const progressive = (count: number): ChartOptions<'line'>['animations'] => {
  const step = DURATION_MS / Math.max(count, 1);
  // Chart.js calls `delay` again on every frame; only the first call for a point should wait. Kept
  // per chart, since the chart rebuilds as its layers load and each rebuild starts over.
  const started = new WeakMap<object, Set<string>>();
  const delay = (prop: string) => (ctx: ScriptableContext<'line'>) => {
    if (ctx.type !== 'data') return 0;
    const seen = started.get(ctx.chart) ?? new Set<string>();
    started.set(ctx.chart, seen);
    const key = `${prop}:${ctx.datasetIndex}:${ctx.dataIndex}`;
    if (seen.has(key)) return 0;
    seen.add(key);
    return ctx.dataIndex * step;
  };
  const previousY = (ctx: ScriptableContext<'line'>) => {
    const meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
    const previous = ctx.dataIndex > 0 ? meta.data[ctx.dataIndex - 1] : undefined;
    return previous
      ? previous.getProps(['y'], true).y
      : ctx.chart.scales.y.getPixelForValue(ctx.chart.scales.y.min);
  };
  const spec = (prop: string, from: number | ((ctx: ScriptableContext<'line'>) => number)) => ({
    type: 'number' as const,
    easing: 'linear' as const,
    duration: step,
    from,
    delay: delay(prop),
  });
  return {
    x: spec('x', NaN),
    y: spec('y', previousY),
  };
};

/**
 * A one-time draw-in for a chart that should arrive as an event, like the home page's hero. Off
 * under reduced motion. `pending` stays true until the series has landed, so a chart can hold back
 * whatever should follow it, and later rebuilds of the chart draw at once instead of replaying.
 */
export const useIntroAnimation = (enabled: boolean, count: number) => {
  const [pending, setPending] = useState(() => enabled && !prefersReducedMotion());
  // Timed rather than Chart.js's onComplete, which also fires when a rebuild stops the first
  // chart's animation partway through.
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => setPending(false), DURATION_MS + 200);
    return () => window.clearTimeout(timer);
  }, [pending]);
  // Once it has played, rebuilds (the callout arriving, a theme change) draw at once rather than
  // running Chart.js's default grow-in over the finished chart.
  const options: Pick<ChartOptions<'line'>, 'animation' | 'animations'> = pending
    ? { animations: progressive(count) }
    : enabled
      ? { animation: false }
      : {};
  return { pending, options };
};
