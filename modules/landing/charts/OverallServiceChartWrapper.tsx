import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useDailyTripsDataLanding } from '../../../common/api/hooks/dailytrips';
import { OverallServiceChart } from './OverallServiceChart';

export const OverallServiceChartWrapper: React.FC = () => {
  const serviceData = useDailyTripsDataLanding();
  const serviceDataReady = serviceData.some((query) => !query.isError && query.data);
  if (!serviceDataReady) return <ChartPlaceHolder query={serviceData[0]} />;
  const serviceDataFiltered = serviceData
    .map((query) => query.data)
    .filter((e): e is Exclude<typeof e, undefined> => e !== undefined);
  return <OverallServiceChart serviceData={serviceDataFiltered} />;
};
