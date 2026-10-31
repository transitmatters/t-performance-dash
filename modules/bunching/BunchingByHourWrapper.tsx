import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { SingleDayDataPoint } from '../../common/types/charts';
import type { Station } from '../../common/types/stations';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { BunchingByHour } from './BunchingByHour';

interface BunchingByHourWrapperProps {
  query: UseQueryResult<SingleDayDataPoint[]>;
  toStation: Station | undefined;
  fromStation: Station | undefined;
}

export const BunchingByHourWrapper: React.FC<BunchingByHourWrapperProps> = ({
  query,
  toStation,
  fromStation,
}) => {
  const dataReady = query.data && toStation && fromStation;
  if (!dataReady) return <ChartPlaceHolder query={query} />;
  return <BunchingByHour headways={query.data} fromStation={fromStation} toStation={toStation} />;
};
