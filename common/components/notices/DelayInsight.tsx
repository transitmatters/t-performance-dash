import React from 'react';
import dayjs from 'dayjs';
import { Trans, useTranslation } from 'react-i18next';
import type { SingleDayDataPoint, BenchmarkFieldKeys, MetricFieldKeys } from '../../types/charts';
import { PointFieldKeys } from '../../types/charts';
import { lineColorVar } from '../../styles/general';
import type { Line } from '../../types/lines';

/** Matches the chart legend's "25%+ off" band, so the callout and the plot agree. */
const BEHIND_SCHEDULE_RATIO = 1.25;

type TimeWindow = 'morningPeak' | 'midday' | 'eveningPeak' | 'evening' | 'earlyMorning';

const TIME_WINDOWS: { key: TimeWindow; start: number; end: number }[] = [
  { key: 'morningPeak', start: 6, end: 10 },
  { key: 'midday', start: 10, end: 15 },
  { key: 'eveningPeak', start: 15, end: 19 },
  { key: 'evening', start: 19, end: 24 },
  { key: 'earlyMorning', start: 0, end: 6 },
];

const windowFor = (hour: number) =>
  TIME_WINDOWS.find((window) => hour >= window.start && hour < window.end)?.key;

interface Insight {
  count: number;
  /** The window holding a real share of the delays, if any. */
  concentrated?: TimeWindow;
}

interface DelayInsightProps {
  data: SingleDayDataPoint[];
  metricField: MetricFieldKeys;
  benchmarkField: BenchmarkFieldKeys;
  /** What the reader is looking at, e.g. "Route 10". */
  subject?: string;
  line?: Line;
}

/**
 * A one-line read of the day, above the charts: how many trips ran well behind their benchmark and
 * when they clustered. Renders nothing when there is no benchmark data or nothing worth flagging.
 */
export const DelayInsight: React.FC<DelayInsightProps> = ({
  data,
  metricField,
  benchmarkField,
  subject,
  line,
}) => {
  const { t } = useTranslation();
  const insight: Insight | undefined = React.useMemo(() => {
    const behind = data.filter((point) => {
      const benchmark = point[benchmarkField];
      const value = point[metricField];
      if (!benchmark || !value) return false;
      return value / benchmark > BEHIND_SCHEDULE_RATIO;
    });
    if (behind.length === 0) return undefined;

    const counts = new Map<TimeWindow, number>();
    behind.forEach((point) => {
      const label = windowFor(dayjs(point[PointFieldKeys.depDt]).hour());
      if (label) counts.set(label, (counts.get(label) ?? 0) + 1);
    });
    const [dominant] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    // Only name a window when it holds a real share of the delays.
    const concentrated = dominant && dominant[1] / behind.length >= 0.4 ? dominant[0] : undefined;
    return { count: behind.length, concentrated };
  }, [data, metricField, benchmarkField]);

  if (!insight) return null;

  const { count, concentrated } = insight;
  const sentence = subject
    ? concentrated
      ? 'notices.delayInsight.subjectDuring'
      : 'notices.delayInsight.subject'
    : concentrated
      ? 'notices.delayInsight.during'
      : 'notices.delayInsight.summary';
  return (
    <div
      style={lineColorVar(line)}
      className="flex flex-row items-center gap-x-2.5 rounded-lg border border-(--line-color)/40 bg-(--line-color)/10 px-4 py-2.5"
    >
      <span className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-(--line-color) text-[11px] font-bold text-stone-900">
        !
      </span>
      <span className="text-[12.5px] leading-snug text-stone-700">
        <Trans
          t={t}
          i18nKey={sentence}
          count={count}
          values={{
            subject,
            window: concentrated && t(`notices.delayInsight.windows.${concentrated}`),
          }}
          components={{ b: <b className="font-semibold" /> }}
        />
      </span>
    </div>
  );
};
