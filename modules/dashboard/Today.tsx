import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
import { Speed } from '../commute/speed/Speed';
import { SlowZonesMap } from '../slowzones/map';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { useSlowzoneAllData, useSlowzoneSpeedRestrictions } from '../../common/api/hooks/slowzones';
import { WidgetTitle } from './WidgetTitle';

interface TodayProps {
  lineShort: 'Red' | 'Orange' | 'Blue' | 'Green';
}

export const Today: React.FC<TodayProps> = ({ lineShort }) => {
  const allSlow = useSlowzoneAllData();
  const speedRestrictions = useSlowzoneSpeedRestrictions();
  const canShowSlowZonesMap = lineShort !== 'Green';

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-x-4 gap-y-4 xl:flex-row">
        <Alerts />
        {canShowSlowZonesMap && <Speed />}
      </div>
      {canShowSlowZonesMap && allSlow.data && speedRestrictions.data && (
        <WidgetDiv className="h-full">
          <WidgetTitle title="Slow Zones" />
          <SlowZonesMap
            slowZones={allSlow.data}
            lineName={lineShort}
            direction="horizontal-on-desktop"
            speedRestrictions={speedRestrictions.data}
          />
        </WidgetDiv>
      )}
    </div>
  );
};
