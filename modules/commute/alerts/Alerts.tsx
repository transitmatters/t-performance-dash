import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAlertsForLine } from '../../../common/api/alerts';
import {
  AlertEffect,
  AlertsResponse,
  FormattedAlert,
  UpcomingOrCurrent,
} from '../../../common/types/alerts';
import { Line, LineShort } from '../../../common/types/lines';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { ShuttleAlert } from './ShuttleAlert';
import classNames from 'classnames';
import DropdownArrow from '../../../public/Icons/DropdownArrow.svg';
import { lineColorBackground } from '../../../common/styles/general';
import { DelayAlert } from './DelayAlert';
import { SuspensionAlert } from './SuspensionAlert';
import { lightLineBorder } from './styles/AlertStyles';
import { AlertBox } from './AlertBox';

export const Alerts: React.FC = () => {
  const { line, lineShort } = useDelimitatedRoute();
  const [showUpcoming, setShowUpcoming] = useState(false);
  const alerts = useQuery([lineShort], () => fetchAlertsForLine(lineShort));

  const divStyle = classNames(
    'flex flex-col items-center rounded-md p-2 text-white shadow-dataBox w-full xl:w-1/2 gap-y-2',
    lineColorBackground[line ?? 'DEFAULT']
  );

  if (alerts.isLoading || !line || !lineShort) {
    return <div className={divStyle}>Loading...</div>;
  }
  if (alerts.isError) {
    return <p>Error</p>;
  }

  return (
    <div className={divStyle}>
      <h3 className="text-xl font-bold">Alerts</h3>
      <div className="w-full">
        <p className="text-sm">Today</p>
      </div>

      <AlertBox alerts={alerts.data} lineShort={lineShort} line={line} type={'current'} />
      <div className="flex w-full flex-col">
        <div
          className={classNames('flew-row mb-2 flex cursor-pointer select-none gap-x-1 rounded-sm')}
          onClick={() => setShowUpcoming(!showUpcoming)}
        >
          <p className="text-sm">Upcoming</p>
          <DropdownArrow className={classNames('h-auto w-3', !showUpcoming && '-rotate-90')} />
        </div>

        {showUpcoming && (
          <AlertBox alerts={alerts.data} lineShort={lineShort} line={line} type={'upcoming'} />
        )}
      </div>
    </div>
  );
};
