import type { UseQueryResult } from '@tanstack/react-query';
import { startCase } from '@lodash-utils';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import { CHART_COLORS, LINE_COLORS } from '../../common/constants/colors';
import { rtStations } from '../../common/constants/stations';
import type { ReliabilityEntry } from '../../common/types/dataPoints';
import type { Line, LineShort } from '../../common/types/lines';
import type { AggType } from '../speed/constants/speeds';
import { ReliabilityGraph } from './charts/ReliabilityGraph';
import {
  BUNCHED,
  formatPercent,
  getSubwayStats,
  headwayShare,
  LONG_GAPS,
  toPoints,
  WITHIN_50_150,
  WITHIN_75_125,
} from './utils';

interface SubwayReliabilityProps {
  reliability: UseQueryResult<ReliabilityEntry[]>;
  line: Line;
  lineShort: LineShort;
  agg: AggType;
  startDate?: string;
  endDate?: string;
}

/** stations.json keys directions the other way round from GTFS direction_id. */
const directionName = (lineShort: LineShort, directionId: '0' | '1') => {
  const names = rtStations[lineShort as keyof typeof rtStations]?.direction;
  return startCase(names?.[directionId === '0' ? '1' : '0'] ?? `Direction ${directionId}`);
};

export const SubwayReliability = ({
  reliability,
  line,
  lineShort,
  agg,
  startDate,
  endDate,
}: SubwayReliabilityProps) => {
  const data = reliability.data ?? [];
  const stats = reliability.data ? getSubwayStats(reliability.data) : null;
  const color = LINE_COLORS[line];
  const ready = [reliability, startDate, endDate];
  const graphProps = { agg, startDate: startDate!, endDate: endDate!, kind: 'percent' as const };

  return (
    <>
      {stats && (
        <StatCardGrid>
          <StatCard label="Within 75–125% of schedule" value={formatPercent(stats.within75)} />
          <StatCard label="Within 50–150% of schedule" value={formatPercent(stats.within50)} />
          <StatCard label="Bunched (≤50%)" value={formatPercent(stats.bunched)} />
          <StatCard label="Long gaps (≥150%)" value={formatPercent(stats.longGaps)} />
        </StatCardGrid>
      )}
      <Widget
        title="Headway reliability"
        subtitle="Share of headways close to the scheduled headway"
        ready={ready}
      >
        <ReliabilityGraph
          data={[
            {
              label: '75–125%',
              data: toPoints(data, (e) => headwayShare(e, WITHIN_75_125)),
              style: { color },
            },
            {
              label: '50–150%',
              data: toPoints(data, (e) => headwayShare(e, WITHIN_50_150)),
              style: { color: CHART_COLORS.BLUE, width: 1 },
            },
          ]}
          valueAxisLabel="Headways"
          {...graphProps}
        />
      </Widget>
      <Widget
        title="Bunching and long gaps"
        subtitle="Share of headways at half the scheduled gap or less, or half again as long or more"
        ready={ready}
      >
        <ReliabilityGraph
          data={[
            {
              label: 'Bunched',
              data: toPoints(data, (e) => headwayShare(e, BUNCHED)),
              style: { color: CHART_COLORS.RED },
            },
            {
              label: 'Long gaps',
              data: toPoints(data, (e) => headwayShare(e, LONG_GAPS)),
              style: { color: CHART_COLORS.YELLOW },
            },
          ]}
          valueAxisLabel="Headways"
          {...graphProps}
        />
      </Widget>
      <Widget title="By direction" subtitle="Share of headways within 75–125%" ready={ready}>
        <ReliabilityGraph
          data={(['0', '1'] as const).map((direction, i) => ({
            label: directionName(lineShort, direction),
            data: toPoints(data, (e) => headwayShare(e.byDirection?.[direction], WITHIN_75_125)),
            style: i === 0 ? { color } : { color: CHART_COLORS.BLUE, width: 1 },
          }))}
          valueAxisLabel="Within 75–125%"
          {...graphProps}
        />
      </Widget>
    </>
  );
};
