import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftRight } from '@fortawesome/free-solid-svg-icons';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { BusRoute, LineShort } from '../../../common/types/lines';
import { AlertBoxInner } from './AlertBoxInner';
import { getStations } from './AlertUtils';

interface DelayAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  busRoute?: BusRoute;
}

const getDescription = (alert: FormattedAlert, lineShort: LineShort, busRoute?: BusRoute) => {
  const lineOrRoute = busRoute ?? lineShort;
  if (alert.stops.length) {
    const { min, max } = getStations(alert.stops, lineOrRoute);
    return (
      <>
        <p className="mr-1 ">Delays</p>
        <p className="font-bold">{min?.stop_name}</p>
        <FontAwesomeIcon icon={faLeftRight} className={'mx-2 h-4 w-4'} />
        <p className="font-bold">{max?.stop_name}</p>
      </>
    );
  }
  if (lineShort === 'Green' && alert.routes && alert.routes.length) {
    const formattedRoutes = alert.routes
      .filter((route) => route !== 'Mattapan')
      .map((route) => {
        const match = route.match(/-(\w)$/);
        return match ? match[1] : '';
      });
    return (
      <p className="mr-1 ">
        Delays on {lineOrRoute} {!busRoute && 'Line'} ({formattedRoutes?.join(', ')})
      </p>
    );
  }
  return <p className="mr-1 ">Delays</p>;
};

export const DelayAlert: React.FC<DelayAlertProps> = ({ alert, lineShort, type, busRoute }) => {
  return (
    <AlertBoxInner
      header={alert.header}
      Icon={() => <p className={classNames('m-0.5 pl-2 pr-2 text-4xl')}>🐢</p>}
      alert={alert}
      type={type}
    >
      {getDescription(alert, lineShort, busRoute)}
    </AlertBoxInner>
  );
};
