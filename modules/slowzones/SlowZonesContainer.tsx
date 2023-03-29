import dayjs from 'dayjs';
import React from 'react';
import type { DayDelayTotals, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LineShort } from '../../common/types/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
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
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  return (
    <div className="flex flex-col gap-4">
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <div>
          <TotalSlowTime data={delayTotals} startDate={dayjs(startDate)} endDate={dayjs(endDate)} />
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
