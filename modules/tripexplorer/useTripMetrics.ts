import {
  useMultiDayTripMetrics,
  useSingleDayTripMetrics,
} from '../../common/api/hooks/tripExplorer';
import { useTripPage } from '../../common/hooks/usePageParams';
import type { QueryNameKeys, RouteType } from '../../common/types/api';

export const useTripMetrics = (routeType: RouteType, skip: QueryNameKeys[] = []) => {
  const { dates, fromStopIds, toStopIds } = useTripPage();
  const stops = { stop: fromStopIds, from_stop: fromStopIds, to_stop: toStopIds };

  const single = useSingleDayTripMetrics({
    routeType,
    skip,
    params: dates.kind === 'single' ? { ...stops, date: dates.date } : undefined,
  });

  const multi = useMultiDayTripMetrics({
    routeType,
    skip,
    params:
      dates.kind === 'range'
        ? { ...stops, start_date: dates.startDate, end_date: dates.endDate }
        : undefined,
  });

  return { aggregate: dates.kind === 'range', single, multi };
};
