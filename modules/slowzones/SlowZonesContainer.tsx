import React, { useState } from 'react';

import type { DayDelayTotals, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LineShort } from '../../common/types/lines';

import { LineSegments } from './charts/LineSegments';
import { TotalSlowTime } from './charts/TotalSlowTime';
import { SlowZonesMap } from './map';
import { isSlowZonesLine } from './types';
interface SlowZonesContainerProps {
  delayTotals: DayDelayTotals[] | undefined;
  allSlow: SlowZoneResponse[];
  line: LineShort | undefined;
}

const views = [
  { id: 0, name: 'Map' },
  { id: 1, name: 'Line Segments' },
  { id: 2, name: 'Total Slow Time' },
];

export const SlowZonesContainer: React.FC<SlowZonesContainerProps> = ({
  allSlow,
  delayTotals,
  line,
}) => {
  const [selectedView, setSelectedView] = useState(views[0]);

  const renderSelectedView = () => {
    if (!isSlowZonesLine(line)) {
      return null;
    }
    if (selectedView.id === 0 && line) {
      return (
        <SlowZonesMap
          slowZones={allSlow}
          lineName={line}
          direction="horizontal-on-desktop"
          key={line}
        />
      );
    }
    if (selectedView.id === 1) {
      return <LineSegments data={allSlow} line={line} />;
    }
    if (selectedView.id === 2) {
      return (
        <TotalSlowTime
          data={delayTotals?.filter((t) => new Date(t.date) > new Date(2020, 0, 1))}
          line={line}
        />
      );
    }
    return null;
  };

  return (
    <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
      {renderSelectedView()}
    </div>
  );
};
