import type { AlertsResponse, UpcomingOrCurrent } from '../../common/types/alerts';

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
