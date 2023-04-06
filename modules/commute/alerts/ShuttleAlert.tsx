import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { LineShort } from '../../../common/types/lines';
import BetweenArrow from '../../../public/Icons/BetweenArrow.svg';
import ShuttleIcon from '../../../public/Icons/ShuttleIcon.svg';
import { AlertBoxInner } from './AlertBoxInner';
import { getStations } from './AlertUtils';

interface ShuttleAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
}
export const ShuttleAlert: React.FC<ShuttleAlertProps> = ({ alert, lineShort, type }) => {
  const { min, max } = getStations(alert.stops, lineShort);
  return (
    <AlertBoxInner header={alert.header} Icon={ShuttleIcon} type={type} alert={alert}>
      <p className="mr-1 ">Shuttling</p>
      <p className="font-bold">{min.stop_name}</p>
      <BetweenArrow className="mx-2 h-4 w-4" />
      <p className="font-bold">{max.stop_name}</p>
    </AlertBoxInner>
  );
};
