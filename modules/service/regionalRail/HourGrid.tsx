import type { ReactNode } from 'react';
import { cn } from '../../../common/utils/cn';
import { SPAN_HOUR_INDEXES, formatHour, hourLevel } from './utils';

// Commuter Rail purple, lifted on dark cards where the brand shade sinks into the background
const LEVEL_CLASS = {
  0: 'bg-muted text-muted-foreground',
  1: 'bg-[#80276c]/20 text-foreground dark:bg-[#c05fa8]/25',
  2: 'bg-[#80276c]/70 text-white dark:bg-[#c05fa8]/60',
  3: 'bg-[#80276c] text-white dark:bg-[#c05fa8] dark:text-stone-950',
} as const;

const LEGEND = [
  { level: 0, label: 'None' },
  { level: 1, label: '1' },
  { level: 2, label: '2' },
  { level: 3, label: '3+' },
] as const;

// Name, hours, then the stats. On phones the name and stats share a line above the hours.
const ROW =
  'grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5 sm:grid-cols-[9rem_1fr_auto] lg:grid-cols-[12rem_1fr_auto]';
const LABEL = 'col-start-1 row-start-1 min-w-0';
const HOURS =
  'col-span-2 col-start-1 row-start-2 grid grid-cols-20 gap-0.5 sm:col-span-1 sm:col-start-2 sm:row-start-1';
const STATS = 'col-start-2 row-start-1 flex justify-end gap-x-2 text-right sm:col-start-3';
const STAT_CELL = 'w-[4.5rem] shrink-0 whitespace-nowrap tabular-nums sm:w-20';

const shortHour = (hour: number) => formatHour(hour).replace(' AM', 'a').replace(' PM', 'p');

/** Hour labels over the grid, and the stats' column headings. */
export const HourGridHeader = ({ stats }: { stats: string[] }) => (
  <div aria-hidden className={cn(ROW, 'text-[11px] leading-tight text-muted-foreground')}>
    <div className={LABEL} />
    <div className={STATS}>
      {stats.map((stat) => (
        <span key={stat} className={cn(STAT_CELL, 'whitespace-normal')}>
          {stat}
        </span>
      ))}
    </div>
    <div className={cn(HOURS, 'items-end')}>
      {SPAN_HOUR_INDEXES.map((hour, index) => (
        <span
          key={hour}
          className={cn('text-center whitespace-nowrap', index % 3 !== 0 && 'invisible md:visible')}
        >
          {shortHour(hour)}
        </span>
      ))}
    </div>
  </div>
);

interface HourGridRowProps {
  label: ReactNode;
  /** Average trains in each hour of the day, 0 through 23. */
  hours: (number | null)[];
  /** Read out for each hour, e.g. "Outbound, 8 AM: 1.8 trains". */
  describe: (hour: number, trains: number | null) => string;
  stats: ReactNode[];
}

/** One row of the grid: an hour's average trains as a shaded cell, from 5am to 1am. */
export const HourGridRow = ({ label, hours, describe, stats }: HourGridRowProps) => (
  <div className={ROW}>
    <div className={cn(LABEL, 'text-sm font-medium')}>{label}</div>
    <div className={cn(STATS, 'text-xs sm:text-sm')}>
      {stats.map((stat, index) => (
        <span key={index} className={STAT_CELL}>
          {stat}
        </span>
      ))}
    </div>
    <div className={HOURS}>
      {SPAN_HOUR_INDEXES.map((hour) => {
        const trains = hours[hour] ?? null;
        const level = hourLevel(trains);
        const description = describe(hour, trains);
        return (
          <div
            key={hour}
            role="img"
            aria-label={description}
            title={description}
            className={cn(
              'flex h-7 items-center justify-center rounded-[3px] text-[11px] font-medium tabular-nums',
              LEVEL_CLASS[level]
            )}
          >
            <span className="hidden sm:inline">{level === 0 ? '·' : Math.round(trains ?? 0)}</span>
          </div>
        );
      })}
    </div>
  </div>
);

/** What the shades mean. */
export const HourGridLegend = ({ children }: { children?: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
    <span className="flex items-center gap-1.5">
      Trains an hour
      {LEGEND.map(({ level, label }) => (
        <span
          key={level}
          className={cn(
            'flex h-5 min-w-6 items-center justify-center rounded-[3px] px-1 text-[11px] font-medium',
            LEVEL_CLASS[level]
          )}
        >
          {label}
        </span>
      ))}
    </span>
    {children}
  </div>
);

export const HourGrid = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-col gap-2">{children}</div>
);
