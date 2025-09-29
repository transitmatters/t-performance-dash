import { faBus, faTrain, faTrainSubway, faTrainTram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { LINE_OBJECTS } from '../../constants/lines';
import { BUS_DEFAULTS, COMMUTER_RAIL_DEFAULTS } from '../../state/defaults/dateDefaults';
import { lineColorBackground } from '../../styles/general';
import type { Line } from '../../types/lines';
import type { Route } from '../../types/router';
import { getLineSelectionItemHref } from '../../utils/router';

interface MenuDropdownProps {
  line: Line;
  route: Route;
  children: React.ReactNode;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({ line, route, children }) => {
  const selected = line === route.line;
  const [show, setShow] = useState<boolean>(false);

  // Need a timeout so that the selected and previously selected dropdowns do not render as opened simultaneously.
  useEffect(() => {
    setTimeout(() => setShow(true), 0);
  }, [selected]);

  const icon = React.useMemo(() => {
    switch (line) {
      case 'line-bus':
        return faBus;
      case 'line-green':
      case 'line-mattapan':
        return faTrainTram;
      case 'line-commuter-rail':
        return faTrain;
      default:
        return faTrainSubway;
    }
  }, [line]);

  const href = React.useMemo(() => {
    switch (line) {
      case 'line-bus':
        return `/bus/trips/single?busRoute=1&date=${BUS_DEFAULTS.singleTripConfig.date}`;
      case 'line-commuter-rail':
        return `/commuter-rail/trips/single?crRoute=CR-Fairmount&date=${COMMUTER_RAIL_DEFAULTS.singleTripConfig.date}`;
      default:
        return getLineSelectionItemHref(line, route);
    }
  }, [line, route]);

  return (
    <div className={classNames('w-full')}>
      <Link href={href}>
        <div
          className={classNames(
            'flex w-full flex-row items-center gap-2 rounded-t-md py-1 pl-1 text-sm',
            `${lineColorBackground[line ?? 'DEFAULT']}`,
            selected
              ? `bg-opacity-100 text-opacity-95 text-white`
              : `bg-opacity-0 hover:bg-opacity-30 hover:rounded-md`
          )}
        >
          <div
            className={classNames(
              lineColorBackground[line ?? 'DEFAULT'],
              'bg-opacity-75 flex h-8 w-8 items-center justify-center rounded-full'
            )}
          >
            <FontAwesomeIcon icon={icon} size="lg" />
          </div>
          {LINE_OBJECTS[line].name}
        </div>
      </Link>
      {selected && show && children}
    </div>
  );
};
