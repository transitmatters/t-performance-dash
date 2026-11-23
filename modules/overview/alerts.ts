import type { AlertsResponse, AlertTime, UpcomingOrCurrent } from '../../common/types/alerts';

/** The alerts with a period of this kind, each with those periods as `relevantTimes`. */
export const getRelevantAlerts = <Alert extends Pick<AlertsResponse, 'active_period'>>(
  alerts: Alert[],
  type: UpcomingOrCurrent
): (Alert & { relevantTimes: AlertTime[] })[] => {
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
