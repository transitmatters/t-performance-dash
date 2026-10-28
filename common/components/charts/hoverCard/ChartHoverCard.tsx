import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { SEVERITY_COLORS } from '../../../utils/chartTheme';
import { hideHoverCard, useHoverCardStore } from './hoverCardStore';
import type { HoverCard } from './hoverCardStore';
import type { HoverCardContent, HoverCardTone } from './types';
import { cn } from '@/common/utils/cn';

const GAP = 12;
const EDGE = 8;

const toneColor = (tone: HoverCardTone) =>
  tone === 'neutral' ? 'var(--muted-foreground)' : SEVERITY_COLORS[tone];

const Dot = ({ color, borderColor }: { color?: string; borderColor?: string }) => (
  <span
    aria-hidden
    className="inline-block size-2 shrink-0 rounded-full"
    style={{
      backgroundColor: color ?? 'var(--muted-foreground)',
      boxShadow: borderColor ? `inset 0 0 0 1px ${borderColor}` : undefined,
    }}
  />
);

// Wraps onto a second row past this many cars (long Commuter Rail consists)
const CARS_PER_ROW = 6;

const TrainConsist = ({ train }: { train: NonNullable<HoverCardContent['train']> }) => {
  const { label, cars, legend } = train;
  const lastIndex = cars.length - 1;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-muted-foreground">{label}</span>
      <div
        className="grid gap-x-0.75 gap-y-1"
        style={{
          gridTemplateColumns: `repeat(${Math.min(cars.length, CARS_PER_ROW)}, minmax(2.5rem, 1fr))`,
        }}
      >
        {cars.map((car, index) => (
          <div key={car.id} className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                'relative flex h-6 w-full items-center justify-center overflow-hidden rounded-[3px] text-[10px] font-medium tabular-nums',
                // Rounder outer ends make the strip read as one train
                index === 0 && 'rounded-l-[10px]',
                index === lastIndex && 'rounded-r-[10px]',
                car.noReading
                  ? 'border border-dashed border-muted-foreground/50 text-muted-foreground'
                  : !car.color && 'bg-muted'
              )}
              style={
                car.color
                  ? { backgroundColor: `color-mix(in oklab, ${car.color} 24%, transparent)` }
                  : undefined
              }
            >
              {car.id}
              {car.color && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-0.75"
                  style={{ backgroundColor: car.color }}
                />
              )}
            </div>
            {car.detail && (
              <span className="text-[10px] leading-none text-muted-foreground tabular-nums">
                {car.detail}
              </span>
            )}
          </div>
        ))}
      </div>
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap gap-x-2.5 gap-y-0.5 text-muted-foreground">
          {legend.map((entry) => (
            <span key={entry.label} className="inline-flex items-center gap-1">
              {entry.color ? (
                <Dot color={entry.color} />
              ) : (
                <span
                  aria-hidden
                  className="inline-block size-2 shrink-0 rounded-full border border-dashed border-muted-foreground/70"
                />
              )}
              {entry.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const HoverCardBody = ({ content }: { content: HoverCardContent }) => {
  const { title, hero, badge, meter, rows, chips, train, notes } = content;
  const hasDetail = Boolean(
    hero || badge || meter || rows?.length || chips?.values.length || train?.cars.length
  );
  // Under the headline when there is one, otherwise a summary of the rows above it
  const badgeElement = badge && (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-1.5 py-0.5 font-medium">
      <Dot color={toneColor(badge.tone)} />
      {badge.text}
    </span>
  );
  return (
    <div className="flex flex-col gap-2">
      {title && <p className="font-medium text-foreground">{title}</p>}
      {hero && (
        <div className="flex items-baseline gap-1.5">
          {hero.color && (
            <span className="self-center">
              <Dot color={hero.color} />
            </span>
          )}
          <span className="text-xl leading-none font-semibold tabular-nums">{hero.value}</span>
          {hero.unit && <span className="text-muted-foreground">{hero.unit}</span>}
          {hero.caption && (
            <span className="ml-auto pl-3 text-muted-foreground">{hero.caption}</span>
          )}
        </div>
      )}
      {hero && badgeElement}
      {meter && (
        <div className="flex flex-col gap-1">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground"
              style={{
                width: `${Math.min(Math.max(meter.fraction, 0), 1) * 100}%`,
                backgroundColor: meter.color,
              }}
            />
          </div>
          <span className="text-muted-foreground">{meter.label}</span>
        </div>
      )}
      {rows && rows.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 gap-y-1">
          {rows.map((row, index) => (
            <div key={index} className="contents">
              <Dot color={row.color} borderColor={row.borderColor} />
              <dt className={cn('text-muted-foreground', !row.value && 'col-span-2')}>
                {row.label}
              </dt>
              {row.value && (
                <dd className="text-right tabular-nums">
                  <span className="font-medium">{row.value}</span>
                  {row.detail && <span className="block text-muted-foreground">{row.detail}</span>}
                </dd>
              )}
            </div>
          ))}
        </dl>
      )}
      {!hero && badgeElement}
      {chips && chips.values.length > 0 && (
        <div className="flex flex-col gap-1">
          <span className="text-muted-foreground">{chips.label}</span>
          <div className="flex flex-wrap gap-1">
            {chips.values.map((value) => (
              <span
                key={value}
                className="rounded-md bg-muted px-1.5 py-0.5 font-medium tabular-nums"
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      )}
      {train && train.cars.length > 0 && <TrainConsist train={train} />}
      {notes && notes.length > 0 && (
        <div
          className={cn(
            'flex flex-col gap-0.5 text-muted-foreground',
            hasDetail && 'border-t border-border pt-2'
          )}
        >
          {notes.map((note, index) => (
            <p key={index}>{note}</p>
          ))}
        </div>
      )}
    </div>
  );
};

const FloatingCard = ({ card }: { card: HoverCard }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Position after layout so the card's own size decides which side of the point it fits on.
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    const maxLeft = window.innerWidth - width - EDGE;
    const maxTop = window.innerHeight - height - EDGE;
    let left: number;
    let top: number;
    if (card.placement === 'above') {
      left = card.x - width / 2;
      top = card.y - height - GAP / 2;
    } else {
      left = card.x + GAP + width > window.innerWidth - EDGE ? card.x - GAP - width : card.x + GAP;
      top = card.y - height / 2;
    }
    element.style.left = `${Math.round(Math.min(Math.max(left, EDGE), maxLeft))}px`;
    element.style.top = `${Math.round(Math.min(Math.max(top, EDGE), maxTop))}px`;
    // Glide between points, but not in from the corner on first show
    if (!('placed' in element.dataset)) {
      void element.offsetWidth;
      element.dataset.placed = '';
    }
  }, [card]);

  return (
    <div
      ref={ref}
      role="tooltip"
      className="pointer-events-none fixed z-50 w-max max-w-80 min-w-44 animate-in rounded-xl bg-popover p-3 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10 fade-in-0 data-placed:transition-[left,top] data-placed:duration-100 data-placed:ease-out"
    >
      <HoverCardBody content={card.content} />
    </div>
  );
};

/** Renders the open chart hover cards. Mounted once, at the app root. */
export const ChartHoverCard = () => {
  const point = useHoverCardStore((state) => state.point);
  const annotation = useHoverCardStore((state) => state.annotation);
  const open = Boolean(point || annotation);

  // The card is placed in viewport coordinates, so any scroll would leave it behind.
  useEffect(() => {
    if (!open) return;
    const hide = () => {
      hideHoverCard('point');
      hideHoverCard('annotation');
    };
    window.addEventListener('scroll', hide, { capture: true, passive: true });
    return () => window.removeEventListener('scroll', hide, { capture: true });
  }, [open]);

  if (!open) return null;
  return createPortal(
    <>
      {point && <FloatingCard card={point} />}
      {annotation && <FloatingCard card={annotation} />}
    </>,
    document.body
  );
};
