import { useMemo, useState } from 'react';
import { useDelimitatedRoute } from '../../common/utils/router';
import { useRidershipData, useStationRidershipData } from '../../common/api/hooks/ridership';
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
import { getStationById } from '../../common/utils/stations';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { Button } from '../../common/components/inputs/Button';
import { NoDataNotice } from '../../common/components/notices/NoDataNotice';
import { RidershipGraphWrapper } from './RidershipGraphWrapper';
import { getRidershipStats } from './utils/utils';
import { StationRidershipMap } from './map';
import { getStationAverages, getStationSeries, isStationRidershipLine } from './map/utils';

export function RidershipDetails() {
  const {
    line,
    lineShort,
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

  const hasStationMap = isStationRidershipLine(lineShort);
  const stationRidership = useStationRidershipData(
    {
      line_id: lineId,
      start_date: startDate,
      end_date: endDate,
    },
    enabled && hasStationMap
  );
  const stationAverages = useMemo(
    () => getStationAverages(stationRidership.data ?? []),
    [stationRidership.data]
  );
  const isDesktop = useBreakpoint('lg');

  // Keyed by line so switching lines clears the selection, while changing dates keeps it
  const [selection, setSelection] = useState<{ lineId?: string; stationId: null | string }>({
    stationId: null,
  });
  const selectedStationId =
    selection.lineId === lineId && selection.stationId && selection.stationId in stationAverages
      ? selection.stationId
      : null;
  const selectStation = (stationId: null | string) => setSelection({ lineId, stationId });
  const selectedStationName = selectedStationId && getStationById(selectedStationId)?.stop_name;

  const peakRidership = useRidershipBaseline(line, busRoute, crRoute, ferryRoute);
  const stats = ridership.data ? getRidershipStats(ridership.data, peakRidership) : null;
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
          <StatCardGrid>
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
          </StatCardGrid>
        )}
        <Widget
          title={
            selectedStationName ? `Weekday ridership · ${selectedStationName}` : 'Weekday ridership'
          }
          action={
            selectedStationId && (
              <Button onClick={() => selectStation(null)}>Show line total</Button>
            )
          }
          ready={[ridership, startDate, endDate, lineId]}
        >
          <RidershipGraphWrapper
            data={
              selectedStationId && stationRidership.data
                ? getStationSeries(stationRidership.data, selectedStationId)
                : ridership.data!
            }
            stationName={selectedStationName || undefined}
            config={config}
            startDate={startDate!}
            endDate={endDate!}
            line={line}
            busRoute={busRoute}
            crRoute={crRoute}
            ferryRoute={ferryRoute}
          />
        </Widget>
        {hasStationMap && (
          <Widget
            title="Station ridership"
            subtitle="Average weekday fare validations at each gated station. Select a station to chart it above."
            ready={[stationRidership, startDate, endDate]}
          >
            {Object.keys(stationAverages).length > 0 ? (
              <StationRidershipMap
                key={lineShort}
                lineName={lineShort}
                averages={stationAverages}
                direction={isDesktop ? 'horizontal' : 'vertical'}
                selectedStationId={selectedStationId}
                onSelectStation={selectStation}
              />
            ) : (
              <NoDataNotice isLineMetric />
            )}
          </Widget>
        )}
      </ChartPageDiv>
    </PageWrapper>
  );
}
