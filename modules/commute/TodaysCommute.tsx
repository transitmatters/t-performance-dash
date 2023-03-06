import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAlertsForLine } from '../../common/api/alerts';
import { AlertEffect, AlertsResponse } from '../../common/types/alerts';
import { Line, LineShort } from '../../common/types/lines';
import { useDelimitatedRoute } from '../../common/utils/router';
import { ShuttleAlert } from './ShuttleAlert';
import classNames from 'classnames';
import { lineBackground } from './styles/AlertStyles';

const getAlertComponent = (alert: AlertsResponse, lineShort: LineShort, line?: Line) => {
  if (alert.type === AlertEffect.SHUTTLE && alert.stops.length > 0) {
    return <ShuttleAlert stops={alert.stops} lineShort={lineShort} line={line} />;
  }
};

export const TodaysCommute = () => {
  const { line, lineShort } = useDelimitatedRoute();
  const alerts = useQuery([lineShort], () => fetchAlertsForLine(lineShort));

  const divStyle = classNames(
    'flex flex-col items-center rounded-md p-2 text-white shadow-dataBox lg:w-1/2 xl:w-4/12',
    lineBackground[line ?? 'DEFAULT']
  );

  if (alerts.isLoading) {
    return <div className={divStyle}>Loading...</div>;
  }
  return (
    <div className={divStyle}>
      <h3 className="text-lg font-bold">Alerts</h3>
      {!alerts.data || alerts.data.length === 0 ? (
        <p>None</p>
      ) : (
        <div className="flex w-full flex-col gap-y-2">
          {alerts.data.map((alert) => getAlertComponent(alert, lineShort, line))}
          <div className="h-5 w-full bg-white"></div>
        </div>
      )}
    </div>
  );
};
