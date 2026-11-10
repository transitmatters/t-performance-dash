'use client';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { useSpeedBaseline } from '../../common/api/hooks/baselines';
import { Widget } from '../../common/components/widgets';
import { StatCard, StatCardGrid } from '../../common/components/widgets/StatCard';
import {
  formatPercent,
  formatPercentChange,
  halvesDetail,
  statDelta,
} from '../../common/utils/statDelta';
import { getSpeedGraphConfig } from './constants/speeds';
import { getSpeedStats } from './utils/utils';
import { SpeedGraphWrapper } from './SpeedGraphWrapper';

dayjs.extend(utc);

export function SpeedDetails() {
  const {
    line,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const speeds = useDeliveredTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );
  const peak = useSpeedBaseline(line);
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const stats = speeds.data ? getSpeedStats(speeds.data, peak) : null;
  const mph = (value: number) => `${value.toFixed(1)} mph`;
  const words: [string, string] = ['faster', 'slower'];

  return (
    <PageWrapper pageTitle={'Speed'}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.avgSpeed) && (
          <StatCardGrid>
            <StatCard
              label="Average speed"
              value={stats.avgSpeed.toFixed(1)}
              unit="mph"
              delta={statDelta({
                delta: stats.avgSpeedDelta,
                negligible: 0.2,
                magnitude: `${stats.avgSpeedDelta > 0 ? '+' : ''}${mph(stats.avgSpeedDelta)}`,
                words,
                detail: halvesDetail(stats.avgSpeedBefore, stats.avgSpeedAfter, mph),
              })}
            />
            <StatCard
              label="Peak speed"
              value={Number.isFinite(stats.peakSpeed) ? stats.peakSpeed.toFixed(1) : '—'}
              unit="mph"
            />
            <StatCard
              label="Share of historical max"
              value={
                Number.isFinite(stats.percentOfMax)
                  ? `${Math.round(stats.percentOfMax * 100)}%`
                  : '—'
              }
              delta={statDelta({
                delta: stats.percentOfMaxDelta,
                negligible: 0.005,
                magnitude: formatPercentChange(stats.percentOfMaxDelta),
                words,
                detail: halvesDetail(
                  stats.percentOfMaxBefore,
                  stats.percentOfMaxAfter,
                  formatPercent
                ),
              })}
            />
          </StatCardGrid>
        )}
        <Widget title="Speed" subtitle="Average across the line" ready={[speeds]}>
          <SpeedGraphWrapper
            data={speeds.data!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}
