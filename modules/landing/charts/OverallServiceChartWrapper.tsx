import React from 'react';
import { useSpeedDataLanding } from '../../../common/api/hooks/speed';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { OverallServiceChart } from './OverallServiceChart';
import { useDailyTripsDataLanding } from '../../../common/api/hooks/dailytrips';

export const OverallServiceChartWrapper: React.FC = () => {
  const serviceData = useDailyTripsDataLanding();
  const serviceDataReady = serviceData.some((query) => !query.isError && query.data);
  if (!serviceDataReady) return <ChartPlaceHolder query={serviceData[0]} />;
  const serviceDataFiltered = serviceData
    .map((query) => query.data)
    .filter((e): e is Exclude<typeof e, undefined> => e !== undefined);
  return <OverallServiceChart serviceData={serviceDataFiltered} />;
};
