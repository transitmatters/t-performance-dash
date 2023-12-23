import type { ChartDataset } from 'chart.js';
import { round } from 'lodash';
import {
  PEAK_RIDERSHIP,
  PEAK_SCHEDULED_SERVICE,
  PEAK_SPEED,
} from '../../common/constants/baselines';
import { LINE_COLORS } from '../../common/constants/colors';
import type { RidershipCount, DeliveredTripMetrics } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';
import type { AggregateDataPoint, SingleDayDataPoint } from '../../common/types/charts';
import { getStationDistance } from '../../common/utils/stations';

const getDatasetOptions = (line: Line): Partial<ChartDataset<'line'>> => {
  return {
    pointRadius: 4,
    pointHitRadius: 8,
    borderColor: LINE_COLORS[line ?? 'default'],
    borderWidth: 4,
    pointBackgroundColor: LINE_COLORS[line ?? 'default'],
    pointBorderWidth: 0,
    tension: 0,
    datalabels: {
      backgroundColor: LINE_COLORS[line ?? 'default'],
    },
    pointHoverRadius: 6,
    spanGaps: true,
    pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
  };
};

export const convertToSpeedDataset = (data: { [key in Line]?: DeliveredTripMetrics[] }) => {
  return Object.keys(data).map((line: Line) => {
    const datasetOptions = getDatasetOptions(line);
    return {
      ...datasetOptions,
      data:
        data[line]?.map((datapoint) =>
          datapoint.miles_covered
            ? round(
                (100 * datapoint.miles_covered) / (datapoint.total_time / 3600) / PEAK_SPEED[line],
                1
              )
            : Number.NaN
        ) ?? [],
    };
  });
};

function convertSecondsToMph(travelTimeSec: number | undefined, distanceMiles: number | undefined) {
  return distanceMiles && travelTimeSec ? (3600 * distanceMiles) / travelTimeSec : undefined;
}

export const convertToStationSpeedDataset = (
  fromStationId: string,
  toStationId: string,
  data: SingleDayDataPoint[]
) => {
  const intervalDistance = getStationDistance(fromStationId, toStationId);
  const ret =
    data?.map((datapoint) => {
      return {
        ...datapoint,
        speed_mph: convertSecondsToMph(datapoint.travel_time_sec, intervalDistance),
        benchmark_speed_mph: convertSecondsToMph(
          datapoint.benchmark_travel_time_sec,
          intervalDistance
        ),
      };
    }) ?? [];
  return ret;
};

export const convertToAggregateStationSpeedDataset = (
  fromStationId: string,
  toStationId: string,
  data: AggregateDataPoint[]
) => {
  const intervalDistance = getStationDistance(fromStationId, toStationId);

  const ret = data.map((datapoint) => {
    return {
      ...datapoint,
      // could be bad to default to zero here
      '25%': convertSecondsToMph(datapoint['25%'], intervalDistance) ?? 0,
      '50%': convertSecondsToMph(datapoint['50%'], intervalDistance) ?? 0,
      '75%': convertSecondsToMph(datapoint['75%'], intervalDistance) ?? 0,
      mean: convertSecondsToMph(datapoint.mean, intervalDistance) ?? 0,
      max: convertSecondsToMph(datapoint.max, intervalDistance) ?? 0,
      min: convertSecondsToMph(datapoint.min, intervalDistance) ?? 0,
      std: convertSecondsToMph(datapoint.std, intervalDistance) ?? 0,
    };
  });
  console.log(`return value ${JSON.stringify(ret)}`);

  return ret;
};

export const convertToServiceDataset = (data: { [key in Line]?: DeliveredTripMetrics[] }) => {
  return Object.keys(data).map((line: Line) => {
    const datasetOptions = getDatasetOptions(line);
    return {
      ...datasetOptions,
      data:
        data[line]?.map((datapoint) =>
          datapoint.miles_covered
            ? round((100 * datapoint.count) / PEAK_SCHEDULED_SERVICE[line], 1)
            : Number.NaN
        ) ?? [],
    };
  });
};

export const convertToRidershipDataset = (data: { [key in Line]: RidershipCount[] }) => {
  return (
    Object.keys(data).map((line: Line) => {
      const datasetOptions = getDatasetOptions(line);
      return {
        ...datasetOptions,
        data: data[line]?.map((datapoint) =>
          datapoint.count
            ? Math.round(10 * 100 * (datapoint.count / PEAK_RIDERSHIP[line])) / 10
            : Number.NaN
        ),
      };
    }) ?? []
  );
};
