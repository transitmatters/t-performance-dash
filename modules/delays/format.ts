import dayjs from 'dayjs';

/** Delay is counted in whole minutes, so it reads as hours and minutes, never seconds: "38m", "5h 20m". */
export const formatDelay = (minutes: number) => {
  const total = Math.round(Math.abs(minutes));
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  if (!hours) return `${rest}m`;
  return rest ? `${hours}h ${String(rest).padStart(2, '0')}m` : `${hours}h`;
};

// Tick spacings in minutes, so the axis lands on round hours ("4h", "8h") rather than "200, 400".
const AXIS_STEPS = [15, 30, 60, 120, 180, 240, 360, 480, 600, 720, 1200, 1440, 2400, 3600, 6000];

/** Y-axis ticks for minute values: about five of them, on round times. */
export const delayAxisTicks = (maxMinutes: number) => ({
  stepSize: AXIS_STEPS.find((step) => maxMinutes / step <= 5) ?? AXIS_STEPS[AXIS_STEPS.length - 1],
  callback: (value: string | number) => formatDelay(Number(value)),
});

/** How many days each bar covers. Monthly bars are built from the weekly rows (see `toMonthly`). */
export type DelayAgg = 'daily' | 'weekly' | 'monthly';

export const AGG_PERIOD = { daily: 'day', weekly: 'week', monthly: 'month' } as const;

/** Days, weeks up to two years, then months, so a long range isn't hundreds of slivers. */
export const delayAggFor = (startDate: string, endDate: string): DelayAgg => {
  const days = dayjs(endDate).diff(dayjs(startDate), 'day');
  if (days <= 90) return 'daily';
  if (days <= 730) return 'weekly';
  return 'monthly';
};

/** The x-axis begins where the data does, not at a selected start years before alerts were kept. */
export const axisStart = (data: { date: string }[], startDate: string) =>
  data[0] && data[0].date > startDate ? data[0].date : startDate;

const HALF_BAR_HOURS = { daily: 12, weekly: 84, monthly: 15 * 24 };

/**
 * X bounds for bars on a time axis: half a bar either side of the first period and the end. Chart.js's
 * own offset pads by half a tick, which is half a year once ticks are yearly. Monthly bars end at the
 * last complete month rather than the selected end.
 */
export const barAxisBounds = (
  data: { date: string }[],
  startDate: string,
  endDate: string,
  agg: DelayAgg
) => {
  const first = data[0]?.date ?? startDate;
  const last = agg === 'monthly' ? (data[data.length - 1]?.date ?? endDate) : endDate;
  const half = HALF_BAR_HOURS[agg];
  return {
    min: dayjs(first).subtract(half, 'hour').valueOf(),
    max: dayjs(last).add(half, 'hour').valueOf(),
  };
};

/** Time-axis ticks one unit coarser than the bars. Weekly bars label each January with its year. */
export const delayTimeAxis = (agg: DelayAgg) => {
  switch (agg) {
    case 'daily':
      return {
        time: { unit: 'week', tooltipFormat: 'MMM d, yyyy', displayFormats: { week: 'MMM d' } },
        ticks: {},
      } as const;
    case 'weekly':
      return {
        time: {
          unit: 'month',
          tooltipFormat: 'MMM d, yyyy',
          displayFormats: { month: 'MMM', year: 'yyyy' },
        },
        ticks: { major: { enabled: true } },
      } as const;
    case 'monthly':
      return {
        time: { unit: 'year', tooltipFormat: 'MMMM yyyy', displayFormats: { year: 'yyyy' } },
        ticks: {},
      } as const;
  }
};

export const delayPeriodTitle = (agg: DelayAgg, label: string) =>
  agg === 'weekly' ? `Week of ${label}` : label;
