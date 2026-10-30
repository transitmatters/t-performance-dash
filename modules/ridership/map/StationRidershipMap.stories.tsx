import { useState } from 'react';
import { StationRidershipMap } from './StationRidershipMap';

export default {
  title: 'StationRidershipMap',
  component: StationRidershipMap,
};

// Blue Line, week of 2026-09-14
const blueLineAverages = {
  'place-aport': 4612,
  'place-aqucl': 3964,
  'place-bmmnl': 1424,
  'place-bomnl': 1349,
  'place-gover': 6823,
  'place-mvbcl': 6512,
  'place-orhte': 2950,
  'place-rbmnl': 1715,
  'place-sdmnl': 1287,
  'place-state': 9784,
  'place-wimnl': 1611,
  'place-wondl': 4206,
};

const BlueLine = ({ direction }: { direction: 'horizontal' | 'vertical' }) => {
  const [selectedStationId, setSelectedStationId] = useState<null | string>(null);
  return (
    <StationRidershipMap
      lineName="Blue"
      averages={blueLineAverages}
      direction={direction}
      selectedStationId={selectedStationId}
      onSelectStation={setSelectedStationId}
    />
  );
};

export const Horizontal = () => <BlueLine direction="horizontal" />;

export const Vertical = () => <BlueLine direction="vertical" />;
