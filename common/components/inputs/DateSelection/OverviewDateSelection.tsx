import React from 'react';
import { ButtonGroup } from '../../general/ButtonGroup';
import { OverviewRangeTypes } from '../../../constants/dates';

export const OverviewDateSelection = () => {
  const handlePresetSelection = () => {
    null;
  };
  return (
    <ButtonGroup
      pressFunction={handlePresetSelection}
      options={Object.entries(OverviewRangeTypes)}
    />
  );
};
