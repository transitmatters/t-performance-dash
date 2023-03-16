import React, { useMemo } from 'react';
import type {
  AlertsResponse,
  FormattedAlert,
  UpcomingOrCurrent,
} from '../../../common/types/alerts';
import { AlertEffect } from '../../../common/types/alerts';
import type { BusRoute, Line, LineShort } from '../../../common/types/lines';
import { DelayAlert } from './DelayAlert';
import { ShuttleAlert } from './ShuttleAlert';
import { StopClosure } from './StopClosureAlert';
import { SuspensionAlert } from './SuspensionAlert';

interface AlertBoxProps {
  alerts: AlertsResponse[];
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  busLine?: BusRoute;
  line?: Line;
}

const getAlertComponent = (
  alert: FormattedAlert,
  lineShort: LineShort,
  type: UpcomingOrCurrent,
  busLine?: BusRoute,
  line?: Line
) => {
  if (alert.type === AlertEffect.SHUTTLE && alert.stops.length > 0) {
    return (
      <ShuttleAlert alert={alert} lineShort={lineShort} line={line} type={type} key={alert.id} />
    );
  }
  if (alert.type === AlertEffect.DELAY) {
    return (
      <DelayAlert
        alert={alert}
        lineShort={lineShort}
        line={line}
        type={type}
        key={alert.id}
        busLine={busLine}
      />
    );
  }
  if (alert.type === AlertEffect.SUSPENSION) {
    return (
      <SuspensionAlert alert={alert} lineShort={lineShort} line={line} type={type} key={alert.id} />
    );
  }
  if (alert.type === AlertEffect.STOP_CLOSURE && busLine) {
    return <StopClosure alert={alert} busLine={busLine} type={type} key={alert.id} line={line} />;
  }
};

export const AlertBox: React.FC<AlertBoxProps> = ({ alerts, lineShort, busLine, line, type }) => {
  const alertBox = useMemo(() => {
    const relevantAlerts = alerts
      .map((alert) => {
        const relevantTimes = alert.active_period.filter((period) => period[type] === true);
        if (relevantTimes.length > 0) {
          return { ...alert, relevantTimes: relevantTimes };
        }
      })
      // Remove alerts with no relevant times.
      .filter((relevantAlert) => relevantAlert != null);

    if (!relevantAlerts || relevantAlerts.length === 0) {
      return (
        <div className="flex w-full justify-center rounded-sm bg-white bg-opacity-10 px-4 py-2 pb-2">
          <p className="text-stone-100">None</p>
        </div>
      );
    } else {
      return (
        <div className="flex w-full flex-row-reverse gap-x-2 md:flex-col-reverse md:gap-x-0 md:gap-y-2">
          {relevantAlerts.map((alert: FormattedAlert) =>
            getAlertComponent(alert, lineShort, type, busLine, line)
          )}
        </div>
      );
    }
  }, [alerts, type, lineShort, busLine, line]);
  return alertBox;
};
