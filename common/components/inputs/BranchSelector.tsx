import { ButtonGroup } from '../general/ButtonGroup';
import type { LineRouteId } from '../../types/lines';
import { useDelimitatedRoute } from '../../utils/router';

interface BranchSelectorProps {
  routeId: LineRouteId;
  setRouteId: (routeId: LineRouteId) => void;
}

enum GreenLineBranchOptions {
  'Green-B' = 'B',
  'Green-C' = 'C',
  'Green-D' = 'D',
  'Green-E' = 'E',
}

export const BranchSelector = ({ routeId, setRouteId }: BranchSelectorProps) => {
  const { line } = useDelimitatedRoute();
  const selectedIndex = Object.keys(GreenLineBranchOptions).findIndex((route) => route === routeId);

  return (
    <ButtonGroup
      line={line}
      selectedIndex={selectedIndex}
      pressFunction={setRouteId}
      options={Object.entries(GreenLineBranchOptions)}
      additionalDivClass="w-auto"
      additionalButtonClass="flex-none px-3"
    />
  );
};
