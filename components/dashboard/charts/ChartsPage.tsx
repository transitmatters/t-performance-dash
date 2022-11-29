import React from 'react';
import { DateOption } from '../../../types/inputs';
import { Station } from '../../../types/stations';
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
  if (aggregate) {
    return <AggregatePage configuration={configuration} />;
  }
  return <SingleDayPage configuration={configuration} />;
};
