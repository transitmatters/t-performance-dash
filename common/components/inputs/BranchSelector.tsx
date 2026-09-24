import React from 'react';
import { ButtonGroup } from '../general/ButtonGroup';
import type { LineRouteId } from '../../types/lines';
import { useDelimitatedRoute } from '../../utils/router';

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
  const { line } = useDelimitatedRoute();
  const selectedIndex = Object.keys(GreenLineBranchOptions).findIndex((route) => route === routeId);

  // Sized like useChartToggle's segmented control, since it sits in the same card-header slot.
  return (
    <ButtonGroup
      line={line}
      selectedIndex={selectedIndex}
      pressFunction={setRouteId}
      options={Object.entries(GreenLineBranchOptions)}
      additionalDivClass="w-auto"
      additionalButtonClass="px-3"
    />
  );
};
