import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
import { Speed } from '../commute/speed/Speed';
import { SlowZonesMap } from '../slowzones/map';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { useSlowzoneAllData, useSpeedRestrictionData } from '../../common/api/hooks/slowzones';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import type { Line } from '../../common/types/lines';
import { WidgetTitle } from './WidgetTitle';

interface TodayProps {
  lineShort: 'Red' | 'Orange' | 'Blue' | 'Green';
}

export const Today: React.FC<TodayProps> = ({ lineShort }) => {
  const allSlow = useSlowzoneAllData();
  const speedRestrictions = useSpeedRestrictionData({
    lineId: `line-${lineShort.toLowerCase()}` as Line,
    date: new Date().toISOString().split('T')[0],
  });
  const canShowSlowZonesMap = lineShort !== 'Green';

  return (
    <PageWrapper pageTitle={'Today'}>
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-x-4 gap-y-4 xl:flex-row">
          <Alerts />
          {canShowSlowZonesMap && <Speed />}
        </div>
        {canShowSlowZonesMap && allSlow.data && speedRestrictions.data && (
          <WidgetDiv className="h-full">
            <WidgetTitle title="Slow zones" />
            <SlowZonesMap
              key={lineShort}
              slowZones={allSlow.data}
              speedRestrictions={speedRestrictions.data}
              lineName={lineShort}
              direction="horizontal-on-desktop"
            />
          </WidgetDiv>
        )}
      </div>
    </PageWrapper>
  );
};
