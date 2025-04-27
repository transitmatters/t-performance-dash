import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import { AlertEffect } from '../../../common/types/alerts';
import EscalatorIcon from '../../../public/Icons/EscalatorIcon.svg';
import ElevatorIcon from '../../../public/Icons/ElevatorIcon.svg';
import { rtStations } from '../../../common/constants/stations';
import type { LineShort } from '../../../common/types/lines';
import { AlertBoxInner } from './AlertBoxInner';

interface DelayAlertProps {
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
  lineShort: LineShort;
}

export const AccessibilityAlert: React.FC<DelayAlertProps> = ({ alert, type, lineShort }) => {
  // TODO: We don't pass the route id yet
  if (lineShort === 'Commuter Rail' || lineShort === 'Bus') {
    return null;
  }

  // Use rtStations directly since we're not using Commuter Rail or Bus
  const lineMap = rtStations[lineShort];
  const lineStations = lineMap.stations;

  const stops = alert.stops
    .map((stop) => lineStations.find((station) => station.station === stop))
    .filter((stop) => stop !== undefined);

  const alertText =
    alert.type === AlertEffect.ESCALATOR_CLOSURE
      ? 'Escalator out of service at'
      : 'Elevator out of service at';
  const stopsText = stops.map((stop) => stop?.stop_name).join(', ');

  return (
    <AlertBoxInner
      header={alert.header}
      Icon={alert.type === AlertEffect.ESCALATOR_CLOSURE ? EscalatorIcon : ElevatorIcon}
      alert={alert}
      type={type}
      showEffectiveTime={true}
    >
      <span>
        {alertText} <strong>{stopsText}</strong>
      </span>
    </AlertBoxInner>
  );
};
