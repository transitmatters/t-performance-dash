import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useTripMetricsForLanding } from '../../../common/api/hooks/tripmetrics';
import { OverallSpeedChart } from './OverallSpeedChart';

export const OverallSpeedChartWrapper: React.FC = () => {
  const tripMetricData = useTripMetricsForLanding();
  const dataReady = tripMetricData.some((query) => !query.isError && query.data);
  if (!dataReady) return <ChartPlaceHolder query={tripMetricData[0]} />;
  const dataFiltered = tripMetricData
    .map((query) => query.data)
    .filter((e): e is Exclude<typeof e, undefined> => e !== undefined);
  return <OverallSpeedChart speedData={dataFiltered} />;
};
