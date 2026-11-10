import type { FleetMetrics } from '../../../common/types/dataPoints';
import type { FleetMetric, FleetType } from '../constants/fleetTypes';
import { getFleetMixValue } from '../constants/fleetTypes';

const mean = (values: number[]) =>
  values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : NaN;

const finiteValues = (values: (number | undefined | null)[]) =>
  values.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));

// Leading- and trailing-half averages, as on the Speed page.
const halvesMeans = (values: number[]) => {
  const mid = Math.floor(values.length / 2);
  return { before: mean(values.slice(0, mid)), after: mean(values.slice(mid)) };
};

const averageWithDelta = (
  data: FleetMetrics[],
  read: (datapoint: FleetMetrics) => number | undefined
) => {
  const values = finiteValues(data.map(read));
  const { before, after } = halvesMeans(values);
  return { value: mean(values), delta: after - before, before, after };
};

/**
 * Headline numbers for the Fleet page, averaged over the selected range from the rows already
 * fetched for the charts.
 */
export const getFleetStats = (
  data: FleetMetrics[],
  share: FleetMetric | undefined,
  age: FleetMetric,
  types: FleetType[] | undefined
) => {
  const mixShares = (types ?? []).map((type) => ({
    type,
    ...averageWithDelta(data, (datapoint) => getFleetMixValue(datapoint, type)),
  }));
  const mostCommon = mixShares
    .filter(({ value }) => Number.isFinite(value))
    .reduce<(typeof mixShares)[number] | undefined>(
      (best, current) => (!best || current.value > best.value ? current : best),
      undefined
    );

  return {
    share: share ? averageWithDelta(data, (datapoint) => datapoint[share.field]) : undefined,
    // Without a share metric, the newest type's share stands in (FLEET_TYPES runs oldest to newest).
    newestType: mixShares.at(-1),
    age: averageWithDelta(data, (datapoint) => datapoint[age.field]),
    mostCommon,
  };
};
