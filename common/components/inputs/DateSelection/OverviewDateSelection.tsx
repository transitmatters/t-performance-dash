import React from 'react';
import { TimeRangeNames } from '../../../types/inputs';
import { ButtonGroup } from '../../general/ButtonGroup';

export const OverviewDateSelection = () => {
  const handlePresetSelection = (value) => {
    null;
  };
  return (
    <ButtonGroup pressFunction={handlePresetSelection} options={Object.entries(TimeRangeNames)} />
  );
};
