import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { cn } from '../../../../common/utils/cn';
import { NEGLIGIBLE_TREND } from '../../config';
import { formatChange, formatDroppedShare } from '../../format';
import type { Mark, Viz } from '../../statements';

// Small charts beside each statement. Each row wears its line's color through `data-line`; the
// numbers stay in text colors.

const pct = (value: number) => `${Math.round(value * 100)}%`;
const LABEL_COLUMN = 'grid grid-cols-[7.5rem_minmax(0,1fr)_3.5rem] items-center gap-2.5';

const MarkRow = ({
  mark,
  title,
  children,
  value,
}: {
  mark: Mark;
  title: string;
  children: ReactNode;
  value: string;
}) => (
  <div data-line={mark.line} title={title} className={cn(LABEL_COLUMN, 'min-h-[22px]')}>
    <span className="flex items-center gap-1.5 truncate font-medium">
      <span className="inline-block size-2.5 flex-none rounded-full bg-primary" />
      {mark.label}
    </span>
    {children}
    <span className="text-right font-semibold tabular-nums">{value}</span>
  </div>
);

/**
 * Labels for the rules drawn through the tracks. With two rules, which can sit close together,
 * the first label ends at its rule and the second starts at its own, so they never overlap.
 */
const RuleLabels = ({
  rules,
  cap = 1,
  showValues = false,
}: {
  rules: { value: number; label: string }[];
  cap?: number;
  showValues?: boolean;
}) => (
  <div className={LABEL_COLUMN}>
    <span />
    <span className="relative h-4 text-xs text-muted-foreground">
      {rules.map((rule, i) => (
        <span
          key={rule.label}
          className={cn(
            'absolute whitespace-nowrap',
            rules.length === 1
              ? '-translate-x-1/2'
              : i === 0
                ? '-translate-x-[calc(100%+4px)]'
                : 'translate-x-1'
          )}
          style={{ left: `${(rule.value / cap) * 100}%` }}
        >
          {rule.label}
          {showValues && ` ${pct(rule.value)}`}
        </span>
      ))}
    </span>
    <span />
  </div>
);

const Rule = ({ at, className }: { at: number; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn('absolute border-l-[1.5px] border-dashed border-foreground/40', className)}
    style={{ left: `${at * 100}%` }}
  />
);

const Dots = ({ viz }: { viz: Extract<Viz, { kind: 'dots' }> }) => (
  <>
    <RuleLabels rules={viz.rules} showValues />
    {viz.marks.map((mark) => (
      <MarkRow
        key={mark.row}
        mark={mark}
        value={pct(mark.value)}
        title={`${mark.label}: ${pct(mark.value)} of gaps on schedule`}
      >
        <span className="relative h-[22px]">
          <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-muted" />
          {viz.rules.map((rule) => (
            <Rule key={rule.label} at={rule.value} className="-top-0.5 -bottom-0.5" />
          ))}
          <span
            className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-primary opacity-50"
            style={{ width: `${mark.value * 100}%` }}
          />
          <span
            className="absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
            style={{ left: `${mark.value * 100}%` }}
          />
        </span>
      </MarkRow>
    ))}
  </>
);

const Bars = ({ viz }: { viz: Extract<Viz, { kind: 'bars' }> }) => {
  const max = Math.max(...viz.marks.map((m) => m.value), 1);
  return (
    <>
      {viz.marks.map((mark) => {
        const trend = mark.trend ?? 0;
        return (
          <MarkRow
            key={mark.row}
            mark={mark}
            value={`${mark.value} ${viz.unit}`}
            title={`${mark.label}: ${mark.value} ${viz.unit} a day`}
          >
            <span className="flex items-center">
              <span
                className="h-3 min-w-0.5 rounded-r bg-primary"
                style={{ width: `${(mark.value / max) * 100}%` }}
              />
              {Math.abs(trend) >= NEGLIGIBLE_TREND && (
                <span
                  className={cn(
                    'ml-1 text-xs font-semibold tabular-nums',
                    trend > 0
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                  )}
                >
                  {trend > 0 ? '▲' : '▼'}
                  {Math.round(Math.abs(trend) * 100)}%
                </span>
              )}
            </span>
          </MarkRow>
        );
      })}
    </>
  );
};

/**
 * Shares of trips, with the change in points from a year earlier: down is better. Marks carry a
 * trend only when it's worth an arrow (the statement drops negligible ones).
 */
const Shares = ({ viz }: { viz: Extract<Viz, { kind: 'shares' }> }) => {
  // A floor on the scale, so a fraction of a percent doesn't fill the track.
  const max = Math.max(...viz.marks.map((m) => m.value), 0.05);
  return (
    <>
      {viz.marks.map((mark) => {
        return (
          <MarkRow
            key={mark.row}
            mark={mark}
            value={formatDroppedShare(mark.value)}
            title={`${mark.label}: ${formatDroppedShare(mark.value)} of scheduled trips ${viz.noun}`}
          >
            <span className="flex items-center">
              <span
                className="h-3 min-w-0.5 rounded-r bg-primary"
                style={{ width: `${(mark.value / max) * 100}%` }}
              />
              {mark.trend != null && (
                <span
                  className={cn(
                    'ml-1 text-xs font-semibold whitespace-nowrap tabular-nums',
                    mark.trend > 0
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                  )}
                >
                  {mark.trend > 0 ? '▲' : '▼'}
                  {Math.abs(mark.trend * 100).toFixed(1)} pts
                </span>
              )}
            </span>
          </MarkRow>
        );
      })}
      {viz.marks.some((m) => m.trend != null) && (
        <p className="text-xs text-muted-foreground">Arrows compare with a year earlier.</p>
      )}
    </>
  );
};

/** Changes either side of zero, in the text's own colors: more riders isn't a score. */
const Changes = ({ viz }: { viz: Extract<Viz, { kind: 'changes' }> }) => {
  const reach = Math.max(...viz.marks.map((m) => Math.abs(m.value)), 0.05);
  return (
    <>
      {viz.marks.map((mark) => {
        const width = (Math.abs(mark.value) / reach) * 50;
        return (
          <MarkRow
            key={mark.row}
            mark={mark}
            value={formatChange(mark.value)}
            title={`${mark.label}: ${formatChange(mark.value)} riders from a year earlier`}
          >
            <span className="relative h-3">
              <Rule at={0.5} className="-top-1 -bottom-1" />
              <span
                className={cn(
                  'absolute inset-y-0 min-w-0.5 bg-primary',
                  mark.value >= 0 ? 'rounded-r' : 'rounded-l'
                )}
                style={
                  mark.value >= 0
                    ? { left: '50%', width: `${width}%` }
                    : { right: '50%', width: `${width}%` }
                }
              />
            </span>
          </MarkRow>
        );
      })}
      <RuleLabels rules={[{ value: 0.5, label: 'A year earlier' }]} />
    </>
  );
};

const Meters = ({ viz }: { viz: Extract<Viz, { kind: 'meters' }> }) => (
  <>
    {viz.marks.map((mark) => (
      <MarkRow
        key={mark.row}
        mark={mark}
        value={pct(mark.value)}
        title={`${mark.label}: ${pct(mark.value)}${viz.rule ? ` of its ${viz.rule.label.toLowerCase()}` : ''}`}
      >
        <span className="relative h-3 rounded bg-muted">
          <span
            className="absolute inset-y-0 left-0 rounded bg-primary"
            style={{ width: `${(Math.min(mark.value, viz.cap) / viz.cap) * 100}%` }}
          />
          {viz.rule && <Rule at={viz.rule.value / viz.cap} className="-top-1 -bottom-1" />}
        </span>
      </MarkRow>
    ))}
    {viz.rule && (
      <RuleLabels
        rules={[{ ...viz.rule, label: `Each line's ${viz.rule.label.toLowerCase()}` }]}
        cap={viz.cap}
      />
    )}
  </>
);

const AREA_WIDTH = 600;
const AREA_HEIGHT = 150;

const SlowZoneArea = ({ viz }: { viz: Extract<Viz, { kind: 'area' }> }) => {
  const { series, peak, now } = viz;
  const last = series.length - 1;
  const x = (i: number) => (i / last) * AREA_WIDTH;
  const y = (minutes: number) => AREA_HEIGHT - (minutes / peak[1]) * (AREA_HEIGHT - 8);
  const line = series
    .map(([, minutes], i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(minutes).toFixed(1)}`)
    .join('');
  const peakAt = series.findIndex(([month]) => month === peak[0]) / last;
  const years = series.flatMap(([month], i) =>
    month.endsWith('-01') && Number(month.slice(0, 4)) % 2 === 0
      ? [{ year: month.slice(0, 4), at: i / last }]
      : []
  );
  const peakText = `${dayjs(`${peak[0]}-01`).format('MMM YYYY')} peak: ${Math.round(peak[1])} min a day`;
  return (
    <div className="relative mt-1 text-amber-700 dark:text-amber-400">
      <svg
        viewBox={`0 0 ${AREA_WIDTH} ${AREA_HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Average minutes a day slow zones added across the subway, by month since ${series[0][0].slice(0, 4)}. ${peakText}; ${now.toFixed(1)} minutes last week.`}
        className="block h-[150px] w-full"
      >
        <path
          d={`${line}L${AREA_WIDTH} ${AREA_HEIGHT}L0 ${AREA_HEIGHT}Z`}
          fill="currentColor"
          fillOpacity={0.16}
        />
        <path
          d={line}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          vectorEffect="non-scaling-stroke"
        />
        <line
          x1={0}
          x2={AREA_WIDTH}
          y1={AREA_HEIGHT - 0.5}
          y2={AREA_HEIGHT - 0.5}
          className="stroke-border"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className="absolute top-0 text-xs font-semibold whitespace-nowrap text-foreground"
        style={{
          left: `${peakAt * 100}%`,
          transform: peakAt > 0.6 ? 'translateX(-102%)' : 'translateX(6px)',
        }}
      >
        {peakText}
      </span>
      <span className="absolute right-0 bottom-6 text-right text-xs leading-tight">
        <b className="text-foreground tabular-nums">{now.toFixed(1)} min</b>
        <br />
        <span className="text-muted-foreground">last week</span>
      </span>
      <div className="relative h-[18px] text-xs text-muted-foreground" aria-hidden="true">
        {years.map(({ year, at }) => (
          <span key={year} className="absolute -translate-x-1/2" style={{ left: `${at * 100}%` }}>
            {year}
          </span>
        ))}
      </div>
    </div>
  );
};

export const StatementViz = ({ viz, note }: { viz: Viz; note?: string }) => (
  <div className="mt-1.5 flex flex-col gap-1.5 text-sm">
    {viz.kind === 'dots' && <Dots viz={viz} />}
    {viz.kind === 'bars' && <Bars viz={viz} />}
    {viz.kind === 'meters' && <Meters viz={viz} />}
    {viz.kind === 'shares' && <Shares viz={viz} />}
    {viz.kind === 'changes' && <Changes viz={viz} />}
    {viz.kind === 'area' && <SlowZoneArea viz={viz} />}
    {note && <p className="mt-1 text-xs text-pretty text-muted-foreground">{note}</p>}
  </div>
);
