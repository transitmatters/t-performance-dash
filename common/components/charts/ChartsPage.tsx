import React from 'react';
import type { DateOption } from '../../types/inputs';
import type { Station } from '../../types/stations';
import { AggregatePage } from './AggregatePage';
import { SingleDayPage } from './SingleDayPage';

interface ChartsPageProps {
  configuration: {
    fromStation: Station;
    toStation: Station;
    dateSelection: DateOption;
  };
  aggregate: boolean;
}

export const ChartsPage: React.FC<ChartsPageProps> = ({ configuration, aggregate }) => {
  const { fromStation, toStation, dateSelection } = configuration;
  const { endDate, startDate } = dateSelection;
  if (aggregate && typeof endDate === 'string' && typeof startDate === 'string') {
    return (
      <AggregatePage
        fromStation={fromStation}
        toStation={toStation}
        startDate={startDate}
        endDate={endDate}
      />
    );
  }
  if (typeof startDate === 'string')
    return <SingleDayPage fromStation={fromStation} toStation={toStation} startDate={startDate} />;
  return null;
};
