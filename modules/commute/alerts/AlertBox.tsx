import React, { useMemo } from 'react';
import type {
  AlertsResponse,
  FormattedAlert,
  UpcomingOrCurrent,
} from '../../../common/types/alerts';
import { AlertEffect } from '../../../common/types/alerts';
import type { BusRoute, LineShort } from '../../../common/types/lines';
import { DelayAlert } from './DelayAlert';
import { ShuttleAlert } from './ShuttleAlert';
import { StopClosure } from './StopClosureAlert';
import { SuspensionAlert } from './SuspensionAlert';
import { AccessibilityAlert } from './AccessibilityAlert';

interface AlertBoxProps {
  alerts: AlertsResponse[];
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  busRoute?: BusRoute;
}

export const getRelevantAlerts = (alerts: AlertsResponse[], type: UpcomingOrCurrent) => {
  return (
    alerts
      .map((alert) => {
        const relevantTimes = alert.active_period.filter((period) => period[type] === true);
        if (relevantTimes.length > 0) {
          return { ...alert, relevantTimes: relevantTimes };
        }
      })
      // Remove alerts with no relevant times.
      .filter((relevantAlert) => relevantAlert != null)
  );
};

const getAlertComponent = (
  alert: FormattedAlert,
  lineShort: LineShort,
  type: UpcomingOrCurrent,
  busRoute?: BusRoute
) => {
  if (alert.type === AlertEffect.SHUTTLE && alert.stops.length > 0) {
    return <ShuttleAlert alert={alert} lineShort={lineShort} type={type} key={alert.id} />;
  }
  if (alert.type === AlertEffect.DELAY) {
    return (
      <DelayAlert
        alert={alert}
        lineShort={lineShort}
        type={type}
        key={alert.id}
        busRoute={busRoute}
      />
    );
  }
  if (alert.type === AlertEffect.SUSPENSION) {
    return <SuspensionAlert alert={alert} lineShort={lineShort} type={type} key={alert.id} />;
  }
  if (alert.type === AlertEffect.STOP_CLOSURE && busRoute) {
    return <StopClosure alert={alert} type={type} key={alert.id} />;
  }
  if ([AlertEffect.ELEVATOR_CLOSURE, AlertEffect.ESCALATOR_CLOSURE].includes(alert.type)) {
    return <AccessibilityAlert alert={alert} type={type} lineShort={lineShort} key={alert.id} />;
  }
};

export const AlertBox: React.FC<AlertBoxProps> = ({ alerts, lineShort, busRoute, type }) => {
  const alertBox = useMemo(() => {
    const relevantAlerts = getRelevantAlerts(alerts, type);

    if (!relevantAlerts || relevantAlerts.length === 0) {
      return (
        <div className="flex w-full justify-center rounded-sm bg-black bg-opacity-10 px-4 py-2 pb-2">
          <p className="text-stone-100">None</p>
        </div>
      );
    } else {
      return (
        <div className="flex w-full flex-row-reverse gap-x-2 md:flex-col-reverse md:gap-x-0 md:gap-y-2">
          {relevantAlerts.map((alert: FormattedAlert) =>
            getAlertComponent(alert, lineShort, type, busRoute)
          )}
        </div>
      );
    }
  }, [alerts, type, lineShort, busRoute]);
  return alertBox;
};
