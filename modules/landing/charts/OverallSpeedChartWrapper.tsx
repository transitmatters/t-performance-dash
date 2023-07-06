import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useDailyTripsDataLanding } from '../../../common/api/hooks/dailytrips';
import { OverallSpeedChart } from './OverallSpeedChart';

export const OverallSpeedChartWrapper: React.FC = () => {
  const dailyTripsData = useDailyTripsDataLanding();
  const dataReady = dailyTripsData.some((query) => !query.isError && query.data);
  if (!dataReady) return <ChartPlaceHolder query={dailyTripsData[0]} />;
  const dataFiltered = dailyTripsData
    .map((query) => query.data)
    .filter((e): e is Exclude<typeof e, undefined> => e !== undefined);
  return <OverallSpeedChart speedData={dataFiltered} />;
};
