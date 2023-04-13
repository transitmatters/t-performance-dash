import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAllSlow } from '../../common/api/slowzones';
import { Alerts } from '../commute/alerts/Alerts';
import { Speed } from '../commute/speed/Speed';
import { SlowZonesMap } from '../slowzones/map';
import { widgetStyle } from '../../common/styles/widgets';
import { WidgetTitle } from './WidgetTitle';

interface TodayProps {
  lineShort: 'Red' | 'Orange' | 'Blue' | 'Green';
}

export const Today: React.FC<TodayProps> = ({ lineShort }) => {
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const canShowSlowZonesMap = lineShort !== 'Green';

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-x-4 gap-y-4 xl:flex-row">
        <Alerts />
        {canShowSlowZonesMap && <Speed />}
      </div>
      {canShowSlowZonesMap && allSlow.data && (
        <div className={widgetStyle}>
          <WidgetTitle title="Slow Zones" />
          <SlowZonesMap
            slowZones={allSlow.data}
            lineName={lineShort}
            direction="horizontal-on-desktop"
          />
        </div>
      )}
    </div>
  );
};
