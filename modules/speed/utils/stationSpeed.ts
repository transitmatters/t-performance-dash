import type { AggregateDataPoint, SingleDayDataPoint } from '../../../common/types/charts';
import { getStationDistance } from '../../../common/utils/stationDistances';

function convertSecondsToMph(travelTimeSec: number | undefined, distanceMiles: number | undefined) {
  if (distanceMiles && travelTimeSec) {
    return (3600 * distanceMiles) / travelTimeSec;
  }
  return undefined;
}

export const convertToStationSpeedDataset = (
  fromStationId: string,
  toStationId: string,
  data: SingleDayDataPoint[]
) => {
  const intervalDistance = getStationDistance(fromStationId, toStationId);
  return (
    data?.map((datapoint) => ({
      ...datapoint,
      speed_mph: convertSecondsToMph(datapoint.travel_time_sec, intervalDistance),
      benchmark_speed_mph: convertSecondsToMph(
        datapoint.benchmark_travel_time_sec,
        intervalDistance
      ),
    })) ?? []
  );
};

export const convertToAggregateStationSpeedDataset = (
  fromStationId: string,
  toStationId: string,
  data: AggregateDataPoint[]
): AggregateDataPoint[] => {
  const intervalDistance = getStationDistance(fromStationId, toStationId);
  const mph = (sec: number) => convertSecondsToMph(sec, intervalDistance) ?? 0;
  // Speed runs opposite to time, so the slowest trip is the longest one: the 25th-percentile
  // speed comes from the 75th-percentile time, and min/max swap too. A time std has no mph
  // equivalent, so it's left off.
  return data.map((datapoint) => {
    const speed: AggregateDataPoint = {
      ...datapoint,
      '25%': mph(datapoint['75%']),
      '50%': mph(datapoint['50%']),
      '75%': mph(datapoint['25%']),
      mean: mph(datapoint.mean),
      min: mph(datapoint.max),
      max: mph(datapoint.min),
    };
    delete speed.std;
    return speed;
  });
};
