import { useQuery } from '@tanstack/react-query';
import { ONE_HOUR } from '../../constants/time';
import { PEAK_RIDERSHIP, PEAK_SCHEDULED_SERVICE, PEAK_SPEED } from '../../constants/baselines';
import type { BusRoute, CommuterRailRoute, FerryRoute, Line } from '../../types/lines';
import type { RidershipKey } from '../../types/ridership';
import { getBaseline, lineSeriesId } from '../../utils/baselines';
import { getRidershipLineId } from '../../utils/ridership';
import { fetchHistoricalBaselines } from '../baselines';

export const useHistoricalBaselines = () => {
  return useQuery({
    queryKey: ['historicalBaselines'],
    queryFn: fetchHistoricalBaselines,
    staleTime: ONE_HOUR,
    retry: false,
  });
};

export const useSpeedBaseline = (line: Line | undefined) => {
  const { data } = useHistoricalBaselines();
  return getBaseline(data, 'speed', line, PEAK_SPEED[line ?? 'DEFAULT']);
};

export const useScheduledServiceBaseline = (line: Line | undefined) => {
  const { data } = useHistoricalBaselines();
  return getBaseline(
    data,
    'scheduledService',
    lineSeriesId(line),
    PEAK_SCHEDULED_SERVICE[line ?? 'DEFAULT']
  );
};

export const useRidershipBaseline = (
  line: Line | undefined,
  busRoute?: BusRoute,
  crRoute?: CommuterRailRoute,
  ferryRoute?: FerryRoute
) => {
  const { data } = useHistoricalBaselines();
  const routeIndex = (crRoute ??
    ferryRoute ??
    (busRoute ? busRoute.replaceAll('/', '') : line)) as RidershipKey;
  return getBaseline(
    data,
    'ridership',
    getRidershipLineId(line, busRoute, crRoute, ferryRoute),
    PEAK_RIDERSHIP[routeIndex ?? 'DEFAULT']
  );
};
