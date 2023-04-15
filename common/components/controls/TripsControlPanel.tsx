import React from 'react';
import { DateSelection } from '../inputs/DateSelection/DateSelection';
import { StationSelectorWidget } from '../widgets/StationSelectorWidget';

export const TripsControlPanel = () => {
  return (
    <>
      <DateSelection />
      (
        <StationSelectorWidget
        />
      )}
    </>
  );
};
