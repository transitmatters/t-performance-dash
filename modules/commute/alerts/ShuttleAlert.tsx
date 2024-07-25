import React from 'react';
import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLeftRight } from '@fortawesome/free-solid-svg-icons';
import type { FormattedAlert, UpcomingOrCurrent } from '../../../common/types/alerts';
import type { LineShort } from '../../../common/types/lines';
import { AlertBoxInner } from './AlertBoxInner';
import { getStations } from './AlertUtils';

interface ShuttleAlertProps {
  alert: FormattedAlert;
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  noShrink?: boolean;
}
export const ShuttleAlert: React.FC<ShuttleAlertProps> = ({ alert, lineShort, type, noShrink }) => {
  const { min, max } = getStations(alert.stops, lineShort);
  return (
    <AlertBoxInner
      header={alert.header}
      Icon={() => <p className={classNames('m-0.5 pl-2 pr-2 text-4xl')}>🚌</p>}
      type={type}
      alert={alert}
      noShrink={noShrink}
    >
      <p className="mr-1">Shuttling</p>
      <p className="font-bold">{min?.stop_name}</p>
      <FontAwesomeIcon icon={faLeftRight} className={'mx-2 h-4 w-4'} />
      <p className="font-bold">{max?.stop_name}</p>
    </AlertBoxInner>
  );
};
