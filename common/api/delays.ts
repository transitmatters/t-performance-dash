import { FetchAlertDelaysByLineParams, type FetchAlertDelaysByLineOptions } from '../types/api';
import type { LineDelays } from '../types/delays';
import { withWeekStart } from '../utils/date';
import { apiFetch } from './utils/fetch';

export const fetchLineDelaysByLine = async (
  options: FetchAlertDelaysByLineOptions
): Promise<LineDelays[]> => {
  if (!options[FetchAlertDelaysByLineParams.line]) return [];

  const rows = await apiFetch({
    path: '/api/linedelays',
    options: withWeekStart(options),
    errorMessage: 'Failed to fetch delay metrics',
  });
  return rows.map(({ delay_alert_minutes, ...row }) => ({
    ...row,
    delay_alert_minutes: delay_alert_minutes ?? undefined,
  }));
};
