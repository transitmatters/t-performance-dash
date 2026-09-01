'use client';
import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useScheduledService, useServiceHours } from '../../common/api/hooks/service';
import { Layout } from '../../common/layouts/layoutTypes';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { Widget } from '../../common/components/widgets';
import { StatCard, type StatSentiment } from '../../common/components/widgets/StatCard';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { getServiceStats } from './utils/utils';
import { ServiceGraphWrapper } from './ServiceGraphWrapper';
import { PercentageServiceGraphWrapper } from './PercentageServiceGraphWrapper';
import { ServiceHoursGraph } from './ServiceHoursGraph';
import { DailyServiceHistogram } from './DailyServiceHistogram';

dayjs.extend(utc);

export function ServiceDetails() {
  const {
    line,
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const { value: comparison, control: comparisonControl } = useChartToggle(
    'Scheduled' as const,
    [
      ['Scheduled', 'Scheduled'],
      ['Historical Maximum', 'Historical Maximum'],
    ],
    // Long labels overflow the segmented control in the card header; a dropdown fits cleanly.
    { variant: 'select' }
  );
  const { value: dayKind, control: dayKindControl } = useChartToggle('weekday' as const, [
    ['weekday', 'Weekday'],
    ['saturday', 'Saturday'],
    ['sunday', 'Sunday'],
  ]);
  const config = getSpeedGraphConfig(dayjs(startDate), dayjs(endDate));
  const enabled = Boolean(startDate && endDate && line && config.agg);
  const tripsData = useDeliveredTripMetrics(
    {
      start_date: startDate,
      end_date: endDate,
      agg: config.agg,
      line,
    },
    enabled
  );

  const showServiceHours = line === 'line-red' || line === 'line-orange' || line === 'line-blue';

  const scheduledData = useScheduledService(
    {
      start_date: startDate,
      end_date: endDate,
      route_id: lineShort,
      agg: config.agg,
    },
    enabled
  ).data;

  const serviceHoursData = useServiceHours(
    {
      start_date: startDate,
      end_date: endDate,
      line_id: line,
      agg: config.agg,
    },
    enabled
  );

  if (!startDate || !endDate) {
    return <p>Select a date range to load graphs.</p>;
  }

  const stats =
    tripsData.data && scheduledData ? getServiceStats(tripsData.data, scheduledData, line) : null;
  const deltaFor = (delta: number, negligible: number, unit: 'trips' | 'pp') => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment =
      Math.abs(delta) <= negligible ? 'flat' : delta > 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    const magnitude = unit === 'pp' ? `${Math.round(delta * 100)}pp` : `${Math.round(delta)}`;
    return { label: `${delta > 0 ? '+' : ''}${magnitude} · ${word}`, sentiment };
  };

  return (
    <PageWrapper pageTitle={'Service'}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.avgRoundTrips) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Round trips / day"
              value={`${Math.round(stats.avgRoundTrips)}`}
              unit="/day"
              delta={deltaFor(stats.roundTripsDelta, 1, 'trips')}
            />
            <StatCard
              label="Service delivered"
              value={`${Math.round(stats.percentDelivered * 100)}%`}
              delta={deltaFor(stats.percentDeliveredDelta, 0.005, 'pp')}
            />
            <StatCard
              label="Peak day"
              value={stats.peakCount != null ? `${Math.round(stats.peakCount)}` : '—'}
              unit="round trips"
            />
          </div>
        )}
        <Widget title="Daily round trips" ready={[tripsData, scheduledData]}>
          <ServiceGraphWrapper
            data={tripsData.data!}
            predictedData={scheduledData!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <Widget
          title="Service delivered"
          subtitle={`Compared to ${comparison}`}
          ready={[tripsData, scheduledData]}
          action={comparisonControl}
        >
          <PercentageServiceGraphWrapper
            data={tripsData.data!}
            predictedData={scheduledData!}
            config={config}
            startDate={startDate}
            endDate={endDate}
            comparison={comparison}
          />
        </Widget>
        {showServiceHours && (
          <Widget title="Hours of service" subtitle="Across all trains" ready={[serviceHoursData]}>
            <ServiceHoursGraph
              serviceHours={serviceHoursData.data!}
              agg={config.agg}
              startDate={startDate}
              endDate={endDate}
            />
          </Widget>
        )}
        <Widget
          title="Scheduled service by hour"
          subtitle="Round trips"
          ready={[scheduledData]}
          action={dayKindControl}
        >
          <DailyServiceHistogram scheduledService={scheduledData!} dayKind={dayKind} />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}

ServiceDetails.Layout = Layout.Dashboard;
