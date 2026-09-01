import React from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useRidershipData } from '../../common/api/hooks/ridership';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { ChartPageDiv } from '../../common/components/charts/ChartPageDiv';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { StatCard, type StatSentiment } from '../../common/components/widgets/StatCard';
import { SPEED_RANGE_PARAM_MAP } from '../speed/constants/speeds';
import { WidgetTitle } from '../../common/components/widgets/WidgetTitle';
import { getRidershipLineId } from '../../common/utils/ridership';
import { RidershipGraphWrapper } from './RidershipGraphWrapper';
import { getRidershipStats } from './utils/utils';

export function RidershipDetails() {
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
  const ridershipDataReady = !ridership.isError && startDate && endDate && line && lineId;

  const stats = ridership.data
    ? getRidershipStats(ridership.data, line, busRoute, crRoute, ferryRoute)
    : null;
  const deltaFor = (delta: number, negligible: number) => {
    if (!Number.isFinite(delta)) return undefined;
    const sentiment: StatSentiment =
      Math.abs(delta) <= negligible ? 'flat' : delta > 0 ? 'good' : 'bad';
    const word = sentiment === 'flat' ? 'flat' : sentiment === 'good' ? 'up' : 'down';
    return {
      label: `${delta > 0 ? '+' : ''}${Math.round(delta).toLocaleString('en-us')} · ${word}`,
      sentiment,
    };
  };

  return (
    <PageWrapper pageTitle={'Ridership'}>
      <ChartPageDiv>
        {stats && Number.isFinite(stats.average) && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Average weekday riders"
              value={`${Math.round(stats.average).toLocaleString('en-us')}`}
              delta={deltaFor(stats.averageDelta, 1)}
            />
            <StatCard
              label="Of historical maximum"
              value={
                Number.isFinite(stats.percentage) ? `${Math.round(stats.percentage * 100)}%` : '—'
              }
            />
            <StatCard
              label={
                stats.peakDate ? `Peak day · ${config.getWidgetTitle(stats.peakDate)}` : 'Peak day'
              }
              value={
                stats.peakCount != null
                  ? `${Math.round(stats.peakCount).toLocaleString('en-us')}`
                  : '—'
              }
              unit="riders"
            />
          </div>
        )}
        <WidgetDiv>
          <WidgetTitle title="Weekday ridership" />

          {ridership.data && ridershipDataReady ? (
            <RidershipGraphWrapper
              data={ridership.data}
              config={config}
              startDate={startDate}
              endDate={endDate}
              line={line}
              busRoute={busRoute}
              crRoute={crRoute}
              ferryRoute={ferryRoute}
            />
          ) : (
            <div className="relative flex h-full">
              <ChartPlaceHolder query={ridership} />
            </div>
          )}
        </WidgetDiv>
      </ChartPageDiv>
    </PageWrapper>
  );
}

RidershipDetails.Layout = Layout.Dashboard;
