import React, { useState } from 'react';
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

const getAlertComponent = (
  alert: FormattedAlert,
  lineShort: LineShort,
  type: UpcomingOrCurrent,
  line?: Line
) => {
  if (alert.type === AlertEffect.SHUTTLE && alert.stops.length > 0) {
    return <ShuttleAlert alert={alert} lineShort={lineShort} type={type} line={line} />;
  }
};

interface AlertBoxProps {
  alerts: AlertsResponse[];
  lineShort: LineShort;
  line: Line;
  type: UpcomingOrCurrent;
}

const AlertBox: React.FC<AlertBoxProps> = ({ alerts, lineShort, line, type }) => {
  const relevantAlerts = alerts
    .map((alert) => {
      const relevantTimes = alert.active_period.filter((period) => period[type] === true);
      if (relevantTimes.length > 0) {
        return { ...alert, relevantTimes: relevantTimes };
      }
    })
    // Remove alerts with no relevant times.
    .filter((relevantAlert) => relevantAlert === null);

  if (!relevantAlerts || relevantAlerts.length === 0) {
    return (
      <div className="w-full">
        <p>No {type} alerts.</p>
      </div>
    );
  } else {
    return (
      <div className="flex w-full flex-col-reverse gap-y-2">
        {relevantAlerts.map((alert: FormattedAlert) =>
          getAlertComponent(alert, lineShort, type, line)
        )}
      </div>
    );
  }
};

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
        <p className="text-sm">Current</p>
      </div>

      <AlertBox alerts={alerts.data} line={line} lineShort={lineShort} type={'current'} />
      <div className="flex w-full flex-col">
        <div
          className={classNames('flew-row mb-2 flex cursor-pointer select-none gap-x-1 rounded-sm')}
          onClick={() => setShowUpcoming(!showUpcoming)}
        >
          <p className="text-sm">Upcoming</p>
          <DropdownArrow className={classNames('h-auto w-3', !showUpcoming && '-rotate-90')} />
        </div>

        {showUpcoming && (
          <AlertBox alerts={alerts.data} line={line} lineShort={lineShort} type={'upcoming'} />
        )}
      </div>
    </div>
  );
};
