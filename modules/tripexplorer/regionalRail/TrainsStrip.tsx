import type { CSSProperties } from 'react';
import { cn } from '../../../common/utils/cn';
import { formatClock } from '../../service/regionalRail/utils';

const HOUR = 3600;
// 4am to 2am covers the first and last trains on both schedules
const AXIS_START = 4 * HOUR;
const AXIS_END = 26 * HOUR;

// The ones without `wide` are dropped on phones, where seven labels don't fit
const TICKS = [
  { hour: 6, label: '6 AM', wide: false },
  { hour: 9, label: '9 AM', wide: true },
  { hour: 12, label: 'Noon', wide: false },
  { hour: 15, label: '3 PM', wide: true },
  { hour: 18, label: '6 PM', wide: false },
  { hour: 21, label: '9 PM', wide: true },
  { hour: 24, label: '12 AM', wide: false },
];

const position = (time: number): CSSProperties => {
  const clamped = Math.min(Math.max(time, AXIS_START), AXIS_END);
  return { left: `${(100 * (clamped - AXIS_START)) / (AXIS_END - AXIS_START)}%` };
};

export interface StripRow {
  label: string;
  /** When each train leaves, in seconds after midnight. */
  trains: number[];
  /** The train the trip catches, drawn larger. */
  caught?: number;
  dotClassName: string;
}

interface TrainsStripProps {
  rows: StripRow[];
  /** When the rider leaves, marked across every row. */
  departAt: number;
}

const describeRow = ({ label, trains }: StripRow) =>
  trains.length
    ? `${label}: ${trains.length} trains, from ${formatClock(trains[0])} to ${formatClock(trains[trains.length - 1])}.`
    : `${label}: no trains.`;

/** Every train of the day as a dot, one row per schedule, so the gaps show at a glance. */
export const TrainsStrip = ({ rows, departAt }: TrainsStripProps) => (
  <figure className="flex flex-col">
    <figcaption className="sr-only">{rows.map(describeRow).join(' ')}</figcaption>
    {rows.map((row) => (
      <div
        key={row.label}
        aria-hidden
        className="grid grid-cols-[6rem_1fr] items-center gap-3 sm:grid-cols-[7.5rem_1fr]"
      >
        <div className="text-xs leading-tight">
          <div className="font-semibold tabular-nums">{row.trains.length} trains</div>
          <div className="text-muted-foreground">{row.label}</div>
        </div>
        <div className="relative h-9">
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
          <div
            className="absolute inset-y-0 border-l border-dashed border-foreground/50"
            style={position(departAt)}
          />
          {row.trains.map((time) => (
            <span
              key={time}
              title={formatClock(time)}
              style={position(time)}
              className={cn(
                'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full',
                row.dotClassName,
                time === row.caught ? 'size-3 ring-2 ring-card' : 'size-2'
              )}
            />
          ))}
        </div>
      </div>
    ))}
    <div aria-hidden className="grid grid-cols-[6rem_1fr] gap-3 sm:grid-cols-[7.5rem_1fr]">
      <div />
      <div className="relative h-4 text-[11px] text-muted-foreground">
        {TICKS.map(({ hour, label, wide }) => (
          <span
            key={hour}
            style={position(hour * HOUR)}
            className={cn('absolute -translate-x-1/2 whitespace-nowrap', wide && 'hidden sm:block')}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  </figure>
);
