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
) => {
  const intervalDistance = getStationDistance(fromStationId, toStationId);
  return data.map((datapoint) => ({
    ...datapoint,
    // could be bad to default to zero here
    '25%': convertSecondsToMph(datapoint['25%'], intervalDistance) ?? 0,
    '50%': convertSecondsToMph(datapoint['50%'], intervalDistance) ?? 0,
    '75%': convertSecondsToMph(datapoint['75%'], intervalDistance) ?? 0,
    mean: convertSecondsToMph(datapoint.mean, intervalDistance) ?? 0,
    max: convertSecondsToMph(datapoint.max, intervalDistance) ?? 0,
    min: convertSecondsToMph(datapoint.min, intervalDistance) ?? 0,
    std: convertSecondsToMph(datapoint.std, intervalDistance) ?? 0,
  }));
};
