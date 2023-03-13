import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { Line, LineShort } from '../../../common/types/lines';
import BetweenArrow from '../../../public/Icons/BetweenArrow.svg';
import ShuttleIcon from '../../../public/Icons/ShuttleIcon.svg';
import { AlertBoxInner } from './AlertBoxInner';
import { getStop } from './AlertUtils';

interface ShuttleAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  line?: Line;
}
export const ShuttleAlert: React.FC<ShuttleAlertProps> = ({ alert, lineShort, type, line }) => {
  const min = Math.min(...alert.stops);
  const max = Math.max(...alert.stops);
  return (
    <AlertBoxInner header={alert.header} line={line} Icon={ShuttleIcon} type={type} alert={alert}>
      <div className="flex w-full flex-row items-center pr-2 text-center text-lg">
        <p className="mr-1 ">Shuttling</p>
        <p className="font-bold">{getStop(min, lineShort)}</p>
        <BetweenArrow className="mx-2 h-4 w-4" />
        <p className="font-bold">{getStop(max, lineShort)}</p>
      </div>
    </AlertBoxInner>
  );
};
