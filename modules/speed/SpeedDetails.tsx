'use client';

import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
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
  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const stats = speeds.data ? getSpeedStats(speeds.data, line) : null;
  const deltaFor = (delta: number, negligible: number, unit: 'mph' | 'pp') => {
    if (!Number.isFinite(delta)) return undefined;
    // Speed is a "higher is better" metric, so a positive trend reads as good.
    const sentiment: StatSentiment =
      Math.abs(delta) <= negligible ? 'flat' : delta > 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'faster' : 'slower';
    const magnitude = unit === 'pp' ? `${Math.round(delta * 100)}pp` : `${delta.toFixed(1)} mph`;
    return { label: `${delta > 0 ? '+' : ''}${magnitude} · ${word}`, sentiment };
  };

  return (
    <PageWrapper pageTitle={'Speed'}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.avgSpeed) && (
          <StatCardGrid>
            <StatCard
              label="Average speed"
              value={stats.avgSpeed.toFixed(1)}
              unit="mph"
              delta={deltaFor(stats.avgSpeedDelta, 0.2, 'mph')}
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
              delta={deltaFor(stats.percentOfMaxDelta, 0.005, 'pp')}
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

SpeedDetails.Layout = Layout.Dashboard;
