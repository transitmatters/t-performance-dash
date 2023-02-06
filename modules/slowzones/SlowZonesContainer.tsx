import React, { useState } from 'react';
import type { DayDelayTotals, SlowZoneResponse } from '../../common/types/dataPoints';
import { LineSegments } from './charts/LineSegments';
import { TotalSlowTime } from './charts/TotalSlowTime';

interface SlowZonesContainerProps {
  delayTotals: DayDelayTotals[] | undefined;
  allSlow: SlowZoneResponse[];
  line: string;
}

const graphs = [
  { id: 1, name: 'Line Segments' },
  { id: 2, name: 'Total Slow Time' },
];

export const SlowZonesContainer = ({ allSlow, delayTotals, line }: SlowZonesContainerProps) => {
  const [selectedGraph, setSelectedGraph] = useState(graphs[0]);

  return (
    <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
      {selectedGraph.name === 'Total Slow Time' ? (
        <TotalSlowTime
          data={delayTotals?.filter((t) => new Date(t.date) > new Date(2020, 0, 1))}
          line={line}
        />
      ) : (
        <LineSegments data={allSlow} line={line} />
      )}
    </div>
  );
};
