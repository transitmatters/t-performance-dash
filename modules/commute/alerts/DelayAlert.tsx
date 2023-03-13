import React from 'react';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { Line, LineShort } from '../../../common/types/lines';
import BetweenArrow from '../../../public/Icons/BetweenArrow.svg';
import DelayIcon from '../../../public/Icons/DelayIcon.svg';
import { AlertBoxInner } from './AlertBoxInner';
import { getStop } from './AlertUtils';

interface DelayAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  line?: Line;
}

const getDescription = (alert: FormattedAlert, lineShort: LineShort) => {
  if (alert.stops.length) {
    const min = Math.min(...alert.stops);
    const max = Math.max(...alert.stops);
    return (
      <>
        <p className="mr-1 ">Delays</p>
        <p className="font-bold">{getStop(min, lineShort)}</p>
        <BetweenArrow className="mx-2 h-4 w-4" />
        <p className="font-bold">{getStop(max, lineShort)}</p>
      </>
    );
  }
  if (lineShort == 'Green' && alert.routes && alert.routes.length) {
    const formattedRoutes = alert.routes
      .filter((route) => route !== 'Mattapan')
      .map((route) => {
        const match = route.match(/-(\w)$/);
        return match ? match[1] : '';
      });
    return (
      <p className="mr-1 ">
        Delays on {lineShort} Line ({formattedRoutes?.join(', ')})
      </p>
    );
  }
  return <p className="mr-1 ">Delays on {lineShort} Line</p>;
};

export const DelayAlert: React.FC<DelayAlertProps> = ({ alert, lineShort, type, line }) => {
  return (
    <AlertBoxInner header={alert.header} line={line} Icon={DelayIcon} alert={alert} type={type}>
      <div className="flex w-full flex-row items-center pr-2 text-center text-lg">
        {getDescription(alert, lineShort)}
      </div>
    </AlertBoxInner>
  );
};
