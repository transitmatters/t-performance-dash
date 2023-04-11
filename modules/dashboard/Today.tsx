import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Alerts } from '../commute/alerts/Alerts';
import { Speed } from '../commute/speed/Speed';
import { useDelimitatedRoute } from '../../common/utils/router';
import { SlowZonesMap } from '../slowzones/map';
import { fetchAllSlow } from '../slowzones/api/slowzones';
import { WidgetTitle } from './WidgetTitle';
export default function TodaysCommute() {
  const { tab, line, lineShort } = useDelimitatedRoute();
  const allSlow = useQuery(['allSlow'], fetchAllSlow);
  const canShowSlowZonesMap = lineShort === 'Red' || lineShort === 'Blue' || lineShort === 'Orange';

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex flex-col gap-x-4 gap-y-4 xl:flex-row">
        <Alerts />
        {tab === 'Subway' && line !== 'GL' && <Speed />}
      </div>
      {tab === 'Subway' && canShowSlowZonesMap && allSlow.data && (
        <div className="h-full rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox">
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
}
