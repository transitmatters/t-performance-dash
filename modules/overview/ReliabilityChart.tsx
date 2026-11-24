import type { ReactNode } from 'react';

import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import type { Dataset } from '../../common/components/charts/TimeSeriesChart';
import type { Line } from '../../common/types/lines';
import type { DatedValue } from '../../common/utils/dateAggregation';
import { ReliabilityGraph } from '../reliability/charts/ReliabilityGraph';
import type { HeadwayField, PartialHeadwayCounts } from '../reliability/utils';
import { BUNCHED, headwayShare, ON_TIME } from '../reliability/utils';
import { CHART_CONFIG, buildRow, chartWindowStart } from './scorecardUtils';

/** One period's headway counts: a bus route's trip metrics or a subway line's reliability entry. */
export type DatedHeadwayCounts = NonNullable<PartialHeadwayCounts> & { date: string };

/** Each period's share of headways in `fields`, skipping periods with no headways counted. */
const toHeadwayPoints = (data: DatedHeadwayCounts[], fields: HeadwayField[]): DatedValue[] =>
  data.flatMap((entry) => {
    const share = headwayShare(entry, fields);
    return share === undefined ? [] : [{ date: entry.date, value: share }];
  });

export const reliabilityMeta = (subtitleSuffix = '') =>
  ({
    key: 'reliability',
    label: 'Reliability',
    subtitle: `Headways within 75–125% of schedule${subtitleSuffix}`,
  }) as const;

/** The Reliability row from weekly headway counts. */
export const buildReliabilityRow = (
  data: DatedHeadwayCounts[],
  color: string,
  subtitleSuffix?: string
) =>
  buildRow({
    ...reliabilityMeta(subtitleSuffix),
    points: toHeadwayPoints(data, ON_TIME),
    reducer: 'avg',
    // "%" on the figure, as service delivered has it, rather than spaced off as a unit.
    unit: 'of headways',
    formatValue: (v) => `${v.toFixed(1)}%`,
    formatDelta: (v) => `${v.toFixed(1)} pts`,
    negligibleDelta: 0.5,
    higherIsBetter: true,
    color,
  });

interface ReliabilityChartProps {
  /** Daily headway counts for the chart card's 60 days */
  data: DatedHeadwayCounts[];
  line: Line;
  /** The window's end, for when no period has headways */
  end: string;
  bunchedStyle?: Dataset['style'];
  /** How the figures are counted */
  note: ReactNode;
}

/** The share of headways within 75–125% and bunched, over the last 30 days with data. */
export const ReliabilityChart = ({
  data,
  line,
  end,
  bunchedStyle,
  note,
}: ReliabilityChartProps) => {
  const within = toHeadwayPoints(data, ON_TIME);
  if (!within.length)
    return <NoDataNotice isLineMetric message="No headways recorded in the last 60 days." />;
  const chartEnd = within[within.length - 1]?.date ?? end;
  return (
    <div className="flex flex-col gap-3">
      <ReliabilityGraph
        data={[
          { label: 'Within 75–125%', data: within },
          { label: 'Bunched', data: toHeadwayPoints(data, BUNCHED), style: bunchedStyle },
        ]}
        line={line}
        agg={CHART_CONFIG.agg}
        startDate={chartWindowStart(chartEnd)}
        endDate={chartEnd}
        kind="percent"
        valueAxisLabel="Headways"
      />
      <p className="text-xs text-muted-foreground">{note}</p>
    </div>
  );
};
