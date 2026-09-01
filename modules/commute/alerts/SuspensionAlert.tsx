import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftRight } from '@fortawesome/free-solid-svg-icons';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { LineShort } from '../../../common/types/lines';
import { AlertBoxInner } from './AlertBoxInner';
import { getStations } from './AlertUtils';

interface SuspensionAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  noShrink?: boolean;
}

const getDescription = (alert: FormattedAlert, lineShort: LineShort) => {
  if (alert.stops.length) {
    const { min, max } = getStations(alert.stops, lineShort);

    return (
      <>
        <p className="mr-1">No service</p>
        <p className="font-bold">{min?.stop_name}</p>
        <FontAwesomeIcon icon={faLeftRight} className={'mx-2 h-4 w-4'} />
        <p className="font-bold">{max?.stop_name}</p>
      </>
    );
  }
  return <p className="mr-1">Detours on {lineShort} Line</p>;
};

export const SuspensionAlert: React.FC<SuspensionAlertProps> = ({
  alert,
  lineShort,
  type,
  noShrink,
}) => {
  return (
    <AlertBoxInner
      header={alert.header}
      Icon={() => <p className={classNames('m-0.5 pr-2 pl-2 text-4xl')}>⛔️</p>}
      alert={alert}
      type={type}
      noShrink={noShrink}
    >
      {getDescription(alert, lineShort)}
    </AlertBoxInner>
  );
};
