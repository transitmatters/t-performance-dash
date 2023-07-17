import React from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { useTripMetricsForLanding } from '../../../common/api/hooks/tripmetrics';
import { OverallServiceChart } from './OverallServiceChart';

export const OverallServiceChartWrapper: React.FC = () => {
  const serviceData = useTripMetricsForLanding();
  const serviceDataReady = !serviceData.isLoading && !serviceData.isError;
  if (!serviceDataReady) return <ChartPlaceHolder query={serviceData} />;

  return <OverallServiceChart serviceData={serviceData.data} />;
};
