'use client';
import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useTranslation } from 'react-i18next';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useScheduledService, useServiceHours } from '../../common/api/hooks/service';
import { useScheduledServiceBaseline } from '../../common/api/hooks/baselines';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { getSpeedGraphConfig } from '../speed/constants/speeds';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { useDeliveredTripMetrics } from '../../common/api/hooks/tripmetrics';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import { useChartToggle } from '../../common/hooks/useChartToggle';
import { getServiceStats } from './utils/utils';
import { ServiceGraphWrapper } from './ServiceGraphWrapper';
import { PercentageServiceGraphWrapper } from './PercentageServiceGraphWrapper';
import { ServiceHoursGraph } from './ServiceHoursGraph';
import { DailyServiceHistogram } from './DailyServiceHistogram';

dayjs.extend(utc);

export function ServiceDetails() {
  const { t } = useTranslation(['service', 'common']);
  const {
    line,
    lineShort,
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  const { value: comparison, control: comparisonControl } = useChartToggle(
    'Scheduled' as const,
    [
      ['Scheduled', t('comparison.scheduled')],
      ['Historical Maximum', t('comparison.historicalMaximum')],
    ],
    // Long labels overflow the segmented control in the card header; a dropdown fits cleanly.
    { variant: 'select' }
  );
  const { value: dayKind, control: dayKindControl } = useChartToggle('weekday' as const, [
    ['weekday', t('dayKind.weekday')],
    ['saturday', t('dayKind.saturday')],
    ['sunday', t('dayKind.sunday')],
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
    enabled && showServiceHours
  );
  const peakService = useScheduledServiceBaseline(line);

  if (!startDate || !endDate) {
    return <p>{t('common:notices.selectDateRange')}</p>;
  }

  const stats =
    tripsData.data && scheduledData
      ? getServiceStats(tripsData.data, scheduledData, peakService, config.agg)
      : null;
  const deltaFor = (delta: number, negligible: number, unit: 'trips' | 'pp') => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment =
      Math.abs(delta) <= negligible ? 'flat' : delta > 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'better' : 'worse';
    const magnitude =
      unit === 'pp'
        ? t('common:stats.comparison.percentagePoints', { value: Math.round(delta * 100) })
        : `${Math.round(delta)}`;
    return {
      label: t(`common:stats.delta.${word}`, { delta: `${delta > 0 ? '+' : ''}${magnitude}` }),
      sentiment,
    };
  };

  return (
    <PageWrapper pageTitle={t('common:pages.service.name')}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.avgRoundTrips) && (
          <StatCardGrid>
            <StatCard
              label={t('stats.roundTripsPerDay')}
              value={`${Math.round(stats.avgRoundTrips)}`}
              unit={t('stats.perDay')}
              delta={deltaFor(stats.roundTripsDelta, 1, 'trips')}
            />
            <StatCard
              label={t('serviceDelivered')}
              value={`${Math.round(stats.percentDelivered * 100)}%`}
              delta={deltaFor(stats.percentDeliveredDelta, 0.005, 'pp')}
            />
            <StatCard
              label={t('stats.peakDay')}
              value={stats.peakCount != null ? `${Math.round(stats.peakCount)}` : '—'}
              unit={t('stats.roundTrips')}
            />
          </StatCardGrid>
        )}
        <Widget title={t('dailyRoundTrips')} ready={[tripsData, scheduledData]}>
          <ServiceGraphWrapper
            data={tripsData.data!}
            predictedData={scheduledData!}
            config={config}
            startDate={startDate}
            endDate={endDate}
          />
        </Widget>
        <Widget
          title={t('serviceDelivered')}
          subtitle={
            comparison === 'Scheduled'
              ? t('comparison.comparedToScheduled')
              : t('comparison.comparedToHistoricalMaximum')
          }
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
          <Widget
            title={t('serviceHours.title')}
            subtitle={t('serviceHours.subtitle')}
            ready={[serviceHoursData]}
          >
            <ServiceHoursGraph
              serviceHours={serviceHoursData.data!}
              agg={config.agg}
              startDate={startDate}
              endDate={endDate}
            />
          </Widget>
        )}
        <Widget
          title={t('byHour.title')}
          subtitle={t('byHour.subtitle')}
          ready={[scheduledData]}
          action={dayKindControl}
        >
          <DailyServiceHistogram scheduledService={scheduledData!} dayKind={dayKind} />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}
