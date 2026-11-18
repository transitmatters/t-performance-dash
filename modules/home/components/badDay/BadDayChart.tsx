import { useEffect, useRef, useState } from 'react';
import { useThemeStore } from '../../../../common/state/themeStore';
import { cn } from '../../../../common/utils/cn';
import type { Trip } from './day';
import {
  BENCHMARK,
  CROWDING,
  STATUS,
  buildDay,
  clockText,
  durationText,
  mostCrowding,
} from './day';
import type { Frame, Palette } from './draw';
import {
  DARK_PALETTE,
  LIGHT_PALETTE,
  STILL,
  SLOW_MOTION_MS,
  drawFrame,
  frameAt,
  layoutFor,
  scales,
} from './draw';

const DAY = buildDay();
/** Shows the whole day first, then plays it from the top. */
const START_DELAY_MS = 1600;
const HOVER_RADIUS = 14;

const SUMMARY = `An example day, not real data. Orange Line trips from Malden Center to North Station: snow from 7:30 AM, a low of ${DAY.low}°F, a disabled train at 8:20 AM that stops service for 24 minutes, trips of up to ${durationText(DAY.worst.seconds)} against a 12 minute benchmark, standing room only on the trains after it, and back on time by noon.`;

const CAR_TONE = {
  many: 'border-green-500 bg-green-100 dark:bg-green-900/40',
  few: 'border-amber-500 bg-amber-100 dark:bg-amber-900/40',
  stand: 'border-red-500 bg-red-100 dark:bg-red-900/40',
} as const;

interface Hover {
  trip: Trip;
  x: number;
  y: number;
}

const TripCard = ({ hover, width }: { hover: Hover; width: number }) => {
  const { trip } = hover;
  const diff = trip.seconds - BENCHMARK;
  return (
    <div
      className="pointer-events-none absolute z-10 w-56 -translate-x-1/2 -translate-y-[calc(100%+14px)] rounded-xl border bg-popover px-3 py-2.5 text-xs leading-snug text-popover-foreground shadow-lg sm:w-60"
      style={{ left: Math.min(Math.max(hover.x, 120), width - 120), top: hover.y }}
    >
      <div className="text-muted-foreground">{clockText(trip.minute)} · Orange Line</div>
      <div className="flex items-center gap-1.5 text-lg font-bold tabular-nums">
        <span
          className="inline-block size-2.5 rounded-full"
          style={{ backgroundColor: STATUS[trip.status].color }}
        />
        {durationText(trip.seconds)}
      </div>
      <div className="text-muted-foreground tabular-nums">
        {diff < 0 ? '−' : '+'}
        {durationText(Math.abs(diff))} vs benchmark
      </div>
      <div className="mt-1.5 border-t pt-1.5">
        <b>{CROWDING[mostCrowding(trip)]}</b> · 6 of 6 cars reporting
      </div>
      <div className="mt-1.5 grid grid-cols-6 gap-0.5">
        {trip.cars.map((car) => (
          <span
            key={car.number}
            className={cn(
              'flex flex-col items-center rounded border-b-[3px] pt-0.5 pb-px text-[10px] font-bold tabular-nums',
              CAR_TONE[car.crowding]
            )}
          >
            {car.number}
            <span className="text-[9px] font-medium text-muted-foreground">
              {Math.round(car.load * 100)}%
            </span>
          </span>
        ))}
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">How full each car is</div>
    </div>
  );
};

const LegendDot = ({ color }: { color: string }) => (
  <span
    className="inline-block size-2.5 rounded-full ring-1 ring-foreground/25"
    style={{ backgroundColor: color }}
  />
);

/**
 * The hero chart: a made-up bad morning, played like a recording, to show what the trip charts
 * can draw. It pauses off screen, waits for a press to play under reduced motion, and shows how
 * full each car was when a reader hovers a trip.
 */
export const BadDayChart = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clockRef = useRef<HTMLSpanElement>(null);
  const slowRef = useRef<HTMLSpanElement>(null);
  const toggleRef = useRef<() => void>(() => {});
  const [playState, setPlayState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [hover, setHover] = useState<Hover | null>(null);
  const [width, setWidth] = useState(0);
  // The canvas can't read CSS tokens, so it takes the theme's colors as literals.
  const palette = useThemeStore((state) => state.theme) === 'dark' ? DARK_PALETTE : LIGHT_PALETTE;
  const paletteRef = useRef<Palette>(palette);
  const redrawRef = useRef<() => void>(() => {});

  useEffect(() => {
    paletteRef.current = palette;
    redrawRef.current();
  }, [palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !wrap || !ctx) return;

    const sans = getComputedStyle(canvas).fontFamily;
    let layout = layoutFor(canvas.clientWidth || 600, sans);
    let hovered: Hover | null = null;
    let frame: Frame = STILL;
    // The animation clock: `t0` is when it started, shifted forward by time spent paused.
    let playing = false;
    let userPaused = false;
    let offscreen = false;
    let t0 = 0;
    let stoppedAt = 0;
    let raf = 0;
    const stopped = () => userPaused || offscreen;

    const render = (now: number) => {
      if (playing) {
        const next = frameAt((stopped() ? stoppedAt : now) - t0);
        if (next.done) t0 = now;
        frame = next.done ? frameAt(0) : next;
      } else {
        frame = STILL;
      }
      drawFrame(ctx, layout, DAY, frame, paletteRef.current, hovered ?? undefined);
      if (clockRef.current) clockRef.current.textContent = clockText(frame.minute);
      if (slowRef.current) {
        const e = frame.elapsed;
        slowRef.current.hidden = !(e !== null && e > SLOW_MOTION_MS[0] && e < SLOW_MOTION_MS[1]);
      }
    };
    const tick = (now: number) => {
      render(now);
      raf = requestAnimationFrame(tick);
    };
    /** Runs the frame loop only while something is moving. */
    const sync = () => {
      const run = playing && !stopped();
      if (run && !raf) raf = requestAnimationFrame(tick);
      if (!run && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    const setStopped = (update: () => void) => {
      const now = performance.now();
      const was = stopped();
      update();
      if (!was && stopped()) stoppedAt = now;
      if (was && !stopped()) t0 += now - stoppedAt;
      sync();
      render(now);
    };
    const start = () => {
      playing = true;
      userPaused = false;
      t0 = performance.now();
      stoppedAt = t0;
      setPlayState('playing');
      sync();
    };

    redrawRef.current = () => {
      if (!raf) render(performance.now());
    };
    toggleRef.current = () => {
      if (!playing) return start();
      setStopped(() => (userPaused = !userPaused));
      setPlayState(userPaused ? 'paused' : 'playing');
    };

    const resize = () => {
      layout = layoutFor(canvas.clientWidth, sans);
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(layout.width * dpr);
      canvas.height = Math.round(layout.height * dpr);
      canvas.style.height = `${layout.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      setWidth(layout.width);
      render(performance.now());
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(wrap);
    const visibility = new IntersectionObserver(([entry]) =>
      setStopped(() => (offscreen = !entry.isIntersecting))
    );
    visibility.observe(canvas);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      const rect = canvas.getBoundingClientRect();
      const [mx, my] = [event.clientX - rect.left, event.clientY - rect.top];
      const { x, y, plotBottom } = scales(layout);
      let best: Hover | null = null;
      let bestDistance = HOVER_RADIUS ** 2;
      if (my <= plotBottom + 6) {
        for (const trip of DAY.trips) {
          if (trip.minute > frame.minute) break;
          const [tx, ty] = [x(trip.minute), y(trip.seconds)];
          const distance = (tx - mx) ** 2 + (ty - my) ** 2;
          if (distance < bestDistance) [best, bestDistance] = [{ trip, x: tx, y: ty }, distance];
        }
      }
      if (best?.trip !== hovered?.trip) {
        hovered = best;
        setHover(best);
        if (!raf) render(performance.now());
      }
    };
    const onLeave = () => {
      hovered = null;
      setHover(null);
      if (!raf) render(performance.now());
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const timer = reduceMotion ? undefined : window.setTimeout(start, START_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      visibility.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const pauseLabel = playState === 'playing' ? 'Pause the animation' : 'Play the animation';
  return (
    <figure className="m-0 flex flex-col gap-2.5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <figcaption className="max-w-[56ch] text-sm text-muted-foreground">
          <b className="font-semibold text-foreground">
            A bad morning on the Orange Line, made up to show what the charts can do.
          </b>{' '}
          Travel times from Malden Center to North Station, with the alerts, weather and temperature
          the dashboard draws alongside. Hover any trip to see how full each car was.
        </figcaption>
        <div className="flex items-center gap-3">
          <span
            ref={slowRef}
            hidden
            className="rounded-full border border-amber-600/50 px-2 py-0.5 text-[10px] font-extrabold tracking-widest text-amber-700 uppercase dark:border-yellow-400/50 dark:text-yellow-400"
          >
            Slow motion
          </span>
          <span
            ref={clockRef}
            aria-hidden="true"
            className="font-mono min-w-[7.2ch] text-right text-xl font-semibold tracking-tight tabular-nums sm:text-2xl"
          >
            {clockText(STILL.minute)}
          </span>
          <button
            type="button"
            onClick={() => toggleRef.current()}
            aria-label={pauseLabel}
            className="inline-grid size-9 cursor-pointer place-items-center rounded-full border hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 fill-current">
              <path
                d={playState === 'playing' ? 'M3 2h3.5v12H3zM9.5 2H13v12H9.5z' : 'M4 2l10 6-10 6z'}
              />
            </svg>
          </button>
        </div>
      </div>
      <div ref={wrapRef} className="relative">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={SUMMARY}
          className="block w-full touch-pan-y"
        />
        {hover && <TripCard hover={hover} width={width} />}
      </div>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-1.5">
          <span className="inline-block h-2 w-4 border-t-[1.5px] border-dashed border-muted-foreground bg-muted" />
          TransitMatters benchmark
        </li>
        {/* Spelled out: an object's numeric-looking keys ('25', '50', '100') iterate before 'ok'. */}
        {(['ok', '25', '50', '100'] as const)
          .map((status) => STATUS[status])
          .map(({ label, color }) => (
            <li key={label} className="flex items-center gap-1.5">
              <LegendDot color={color} />
              {label}
            </li>
          ))}
      </ul>
    </figure>
  );
};
