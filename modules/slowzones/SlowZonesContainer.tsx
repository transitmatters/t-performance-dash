import dayjs from 'dayjs';
import React from 'react';
import { SimpleDeltaWidget } from '../../common/components/widgets/internal/SimpleDeltaWidget';
import type { WidgetValueInterface } from '../../common/types/basicWidgets';
import type { DayDelayTotals, SlowZoneResponse } from '../../common/types/dataPoints';
import type { LineShort } from '../../common/types/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { WidgetTitle } from '../dashboard/WidgetTitle';
import { LineSegments } from './charts/LineSegments';
import { TotalSlowTime } from './charts/TotalSlowTime';

interface SlowZonesContainerProps {
  delayTotals: DayDelayTotals[] | undefined;
  allSlow: SlowZoneResponse[];
  line: LineShort | undefined;
  delayWidget: WidgetValueInterface;
  zonesWidget: WidgetValueInterface;
}

export const SlowZonesContainer: React.FC<SlowZonesContainerProps> = ({
  allSlow,
  delayTotals,
  line,
  delayWidget,
  zonesWidget,
}) => {
  const {
    query: { startDate, endDate },
  } = useDelimitatedRoute();
  return (
    <div className="flex flex-col gap-4">
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <WidgetTitle title="Total delays" />
        <SimpleDeltaWidget widgetValue={delayWidget} />
        <div>
          <TotalSlowTime data={delayTotals} startDate={dayjs(startDate)} endDate={dayjs(endDate)} />
        </div>
      </div>
      <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
        <WidgetTitle title="Locations" />

        <SimpleDeltaWidget widgetValue={zonesWidget} />
        <div>
          <LineSegments data={allSlow} line={line} />
        </div>
      </div>
    </div>
  );
};
