import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import { AlertEffect } from '../../../common/types/alerts';
import ClosureIcon from '../../../public/Icons/ClosureIcon.svg';
import { stations } from '../../../common/constants/stations';
import type { LineShort } from '../../../common/types/lines';
import { isLineMap } from '../../../common/types/stations';
import { AlertBoxInner } from './AlertBoxInner';

interface DelayAlertProps {
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
  lineShort: LineShort;
}

export const AccessibilityAlert: React.FC<DelayAlertProps> = ({ alert, type, lineShort }) => {
  const lineStations = stations[lineShort].stations;
  const stops = alert.stops
    .map((stop) =>
      isLineMap(lineStations)
        ? lineStations.stations.find((station) => station.station === stop)
        : lineStations.find((station) => station.station === stop)
    )
    .filter((stop) => stop !== undefined);

  return (
    <AlertBoxInner header={alert.header} Icon={ClosureIcon} alert={alert} type={type}>
      {alert.type === AlertEffect.ESCALATOR_CLOSURE
        ? 'Escalator out of service'
        : 'Elevator out of service'}{' '}
      at {stops.map((stop) => stop?.stop_name).join(', ')}
    </AlertBoxInner>
  );
};
