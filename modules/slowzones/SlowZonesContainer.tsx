import React from 'react';
import type { DayDelayTotals, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LineShort } from '../../common/types/lines';
import { LineSegments } from './charts/LineSegments';
import { TotalSlowTime } from './charts/TotalSlowTime';

interface SlowZonesContainerProps {
  delayTotals: DayDelayTotals[] | undefined;
  allSlow: SlowZoneResponse[];
  line: LineShort | undefined;
}

export const SlowZonesContainer: React.FC<SlowZonesContainerProps> = ({
  allSlow,
  delayTotals,
  line,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <div>
          <TotalSlowTime data={delayTotals} />
        </div>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <div>
          <LineSegments data={allSlow} line={line} />
        </div>
      </div>
    </div>
  );
};
