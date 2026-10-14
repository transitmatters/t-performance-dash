import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatNumber } from '../../common/i18n/format';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { useRidershipBaseline } from '../../common/api/hooks/baselines';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { Widget } from '../../common/components/widgets';
import {
  StatCard,
  StatCardGrid,
  type StatSentiment,
} from '../../common/components/widgets/StatCard';
import { SPEED_RANGE_PARAM_MAP } from '../speed/constants/speeds';
import { getRidershipLineId } from '../../common/utils/ridership';
import { RidershipGraphWrapper } from './RidershipGraphWrapper';
import { getRidershipStats } from './utils/utils';

export function RidershipDetails() {
  const { t } = useTranslation(['ridership', 'common']);
  const {
    line,
    query: { startDate, endDate, busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  const config = SPEED_RANGE_PARAM_MAP.week;
  const lineId = getRidershipLineId(line, busRoute, crRoute, ferryRoute);
  const enabled = Boolean(startDate && endDate && lineId);

  const ridership = useRidershipData(
    {
      line_id: lineId,
      start_date: startDate,
      end_date: endDate,
    },
    enabled
  );

  const peakRidership = useRidershipBaseline(line, busRoute, crRoute, ferryRoute);
  const stats = ridership.data ? getRidershipStats(ridership.data, peakRidership) : null;
  const deltaFor = (delta: number, negligible: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment =
      Math.abs(delta) <= negligible ? 'flat' : delta > 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'up' : 'down';
    return {
      label: t(`common:stats.delta.${word}`, {
        delta: `${delta > 0 ? '+' : ''}${formatNumber(Math.round(delta))}`,
      }),
      sentiment,
    };
  };

  return (
    <PageWrapper pageTitle={t('common:pages.ridership.name')}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.average) && (
          <StatCardGrid>
            <StatCard
              label={t('stats.averageWeekday')}
              value={`${formatNumber(Math.round(stats.average))}`}
              delta={deltaFor(stats.averageDelta, 1)}
            />
            <StatCard
              label={t('stats.ofHistoricalMaximum')}
              value={
                Number.isFinite(stats.percentage) ? `${Math.round(stats.percentage * 100)}%` : '—'
              }
            />
            <StatCard
              label={
                stats.peakDate
                  ? t('stats.peakDayOn', { date: config.getWidgetTitle(stats.peakDate) })
                  : t('stats.peakDay')
              }
              value={stats.peakCount != null ? `${formatNumber(Math.round(stats.peakCount))}` : '—'}
              unit={t('stats.riders')}
            />
          </StatCardGrid>
        )}
        <Widget title={t('weekdayRidership')} ready={[ridership, startDate, endDate, lineId]}>
          <RidershipGraphWrapper
            data={ridership.data!}
            config={config}
            startDate={startDate!}
            endDate={endDate!}
            line={line}
            busRoute={busRoute}
            crRoute={crRoute}
            ferryRoute={ferryRoute}
          />
        </Widget>
      </ChartPageDiv>
    </PageWrapper>
  );
}
