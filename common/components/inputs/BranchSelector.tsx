import React from 'react';
import { ButtonGroup } from '../general/ButtonGroup';
import type { LineRouteId } from '../../types/lines';

interface BranchSelectorProps {
  routeId: LineRouteId;
  setRouteId: (routeId: LineRouteId) => void;
}

enum GreenLineBranchOptions {
  'Green-B' = 'B Branch',
  'Green-C' = 'C Branch',
  'Green-D' = 'D Branch',
  'Green-E' = 'E Branch',
}

export const BranchSelector: React.FunctionComponent<BranchSelectorProps> = ({
  routeId,
  setRouteId,
}) => {
  const selectedIndex = Object.keys(GreenLineBranchOptions).findIndex((route) => route === routeId);

  return (
    <div className={'flex w-full justify-center pt-2'}>
      <ButtonGroup
        selectedIndex={selectedIndex}
        pressFunction={setRouteId}
        options={Object.entries(GreenLineBranchOptions)}
        additionalDivClass="md:w-auto"
        additionalButtonClass="md:w-fit"
      />
    </div>
  );
};
