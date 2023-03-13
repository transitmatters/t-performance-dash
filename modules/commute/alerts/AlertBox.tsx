import React, { useMemo } from 'react';
import type {
  AlertsResponse,
  FormattedAlert,
  UpcomingOrCurrent,
} from '../../../common/types/alerts';
import { AlertEffect } from '../../../common/types/alerts';
import type { Line, LineShort } from '../../../common/types/lines';
import { DelayAlert } from './DelayAlert';
import { ShuttleAlert } from './ShuttleAlert';
import { SuspensionAlert } from './SuspensionAlert';

interface AlertBoxProps {
  alerts: AlertsResponse[];
  lineShort: LineShort;
  type: UpcomingOrCurrent;
  line?: Line;
}

const getAlertComponent = (
  alert: FormattedAlert,
  lineShort: LineShort,
  type: UpcomingOrCurrent,
  line?: Line
) => {
  if (alert.type === AlertEffect.SHUTTLE && alert.stops.length > 0) {
    return (
      <ShuttleAlert alert={alert} lineShort={lineShort} line={line} type={type} key={alert.id} />
    );
  }
  if (alert.type === AlertEffect.DELAY) {
    return (
      <DelayAlert alert={alert} lineShort={lineShort} line={line} type={type} key={alert.id} />
    );
  }
  if (alert.type === AlertEffect.SUSPENSION) {
    return (
      <SuspensionAlert alert={alert} lineShort={lineShort} line={line} type={type} key={alert.id} />
    );
  }
};

export const AlertBox: React.FC<AlertBoxProps> = ({ alerts, lineShort, line, type }) => {
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
  }, [alerts, lineShort, line, type]);
  return alertBox;
};
