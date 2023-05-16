import React from 'react';
import { Alerts } from '../commute/alerts/Alerts';
import { SlowZonesMap } from '../slowzones/map';
import { WidgetDiv } from '../../common/components/widgets/WidgetDiv';
import { useSlowzoneAllData, useSpeedRestrictionData } from '../../common/api/hooks/slowzones';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Speed } from '../commute/speed/Speed';
import { useAccessibilityAlertsData, useAlertsData } from '../../common/api/hooks/alerts';
import { useDelimitatedRoute } from '../../common/utils/router';
import { WidgetTitle } from './WidgetTitle';

interface TodayProps {
  lineShort: 'Red' | 'Orange' | 'Blue' | 'Green';
}

export const Today: React.FC<TodayProps> = ({ lineShort }) => {
  const allSlow = useSlowzoneAllData();
  const speedRestrictions = useSpeedRestrictionData();
  const canShowSlowZonesMap = lineShort !== 'Green';

  const {
    query: { busRoute },
  } = useDelimitatedRoute();
  const rideAlerts = useAlertsData(lineShort, busRoute);
  const accessibilityAlerts = useAccessibilityAlertsData(lineShort);

  return (
    <PageWrapper pageTitle={'Today'}>
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col gap-x-4 gap-y-4 xl:flex-row">
          <Alerts title="Alerts" alerts={rideAlerts} />
          {canShowSlowZonesMap && <Speed />}
          <Alerts title="Accessibility" alerts={accessibilityAlerts} />
        </div>
        {canShowSlowZonesMap && allSlow.data && speedRestrictions.data && (
          <WidgetDiv className="h-full">
            <WidgetTitle title="Slow Zones" />
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
