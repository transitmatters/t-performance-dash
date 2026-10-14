import React from 'react';
import { i18n } from '../../i18n';
import { ButtonGroup } from '../general/ButtonGroup';
import type { LineRouteId } from '../../types/lines';
import { useDelimitatedRoute } from '../../utils/router';

interface BranchSelectorProps {
  routeId: LineRouteId;
  setRouteId: (routeId: LineRouteId) => void;
}

const GreenLineBranchOptions = {
  'Green-B': i18n.t('greenLineBranches.Green-B'),
  'Green-C': i18n.t('greenLineBranches.Green-C'),
  'Green-D': i18n.t('greenLineBranches.Green-D'),
  'Green-E': i18n.t('greenLineBranches.Green-E'),
};

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
