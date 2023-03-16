import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { BusRoute, Line } from '../../../common/types/lines';
import ClosureIcon from '../../../public/Icons/ClosureIcon.svg';
import { AlertBoxInner } from './AlertBoxInner';

interface StopClosureProps {
  alert: FormattedAlert;
  type: UpcomingOrCurrent;
  line?: Line;
  busRoute: BusRoute;
}

export const StopClosure: React.FC<StopClosureProps> = ({ alert, busRoute, type, line }) => {
  return (
    <AlertBoxInner header={alert.header} line={line} Icon={ClosureIcon} alert={alert} type={type}>
      <p className="mr-1 ">Stop Closures</p>
    </AlertBoxInner>
  );
};
