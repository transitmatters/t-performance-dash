import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { SingleDayDataPoint } from '../../../common/types/charts';
import type { Station } from '../../../common/types/stations';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';
import { HeadwaysHistogram } from './HeadwaysHistogram';

interface HeadwaysHistogramWrapperProps {
  headways: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
}

export const HeadwaysHistogramWrapper: React.FC<HeadwaysHistogramWrapperProps> = ({
  headways,
  toStation,
  fromStation,
}) => {
  const dataReady = headways.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={headways} />;
  return (
    <HeadwaysHistogram headways={headways.data} fromStation={fromStation} toStation={toStation} />
  );
};
