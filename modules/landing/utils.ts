import type { ChartDataset } from 'chart.js';
import { round } from 'lodash';
import dayjs from 'dayjs';
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
import { DATE_FORMAT } from '../../common/constants/dates';

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

export const convertToSpeedDataset = (
  data: { [key in Line]?: DeliveredTripMetrics[] },
  labels: string[]
) => {
  return (Object.keys(data) as Line[]).map((line: Line) => {
    // We don't need to show the Mattapan line on the landing page
    if (line === 'line-mattapan') {
      return { data: [] };
    }

    const datasetOptions = getDatasetOptions(line);
    return {
      ...datasetOptions,
      data:
        labels?.map((label) => {
          const datapoint = data[line]?.find((datapoint) => datapoint.date === label);
          if (!datapoint) {
            return null;
          }
          return datapoint.miles_covered
            ? round(
                (100 * datapoint.miles_covered) / (datapoint.total_time / 3600) / PEAK_SPEED[line],
                1
              )
            : null;
        }) ?? [],
    };
  });
};

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

  return ret;
};

export const convertToServiceDataset = (
  data: { [key in Line]?: DeliveredTripMetrics[] },
  labels: string[]
) => {
  return (Object.keys(data) as Line[]).map((line: Line) => {
    // We don't need to show the Mattapan line on the landing page
    if (line === 'line-mattapan') {
      return { data: [] };
    }

    const datasetOptions = getDatasetOptions(line);
    return {
      ...datasetOptions,
      data:
        labels.map((label) => {
          const datapoint = data[line]?.find((datapoint) => datapoint.date === label);
          if (!datapoint) return null;
          return datapoint.miles_covered
            ? round((100 * datapoint.count) / PEAK_SCHEDULED_SERVICE[line], 1)
            : null;
        }) ?? [],
    };
  });
};

export const convertToRidershipDataset = (
  data: { [key in Line]: RidershipCount[] },
  labels: string[]
) => {
  return (
    (Object.keys(data) as Exclude<Line, 'line-bus'>[]).map((line: Exclude<Line, 'line-bus'>) => {
      // We don't need to show the Mattapan line on the landing page
      if (line === 'line-mattapan') {
        return { data: [] };
      }

      const datasetOptions = getDatasetOptions(line);
      return {
        ...datasetOptions,
        data: labels.map((labels) => {
          const datapoint = data[line]?.find((datapoint) => datapoint.date === labels);
          if (!datapoint) return null;
          return datapoint.count
            ? Math.round(10 * 100 * (datapoint.count / PEAK_RIDERSHIP[line])) / 10
            : null;
        }),
      };
    }) ?? []
  );
};

const getLabels = () => {
  // Get the most recent Monday. This date may or may not be in the dataset, but we can still use it to construct the labels.
  // It's important to use Monday, that is the day the weekly trip metrics are based on.
  const latestDate: dayjs.Dayjs = dayjs().startOf('week').add(1, 'day');

  // Generate the labels for the last 14 weeks, starting from the most recent Monday.
  // The endpoint returns 12 weeks, but we add 2 extra weeks in case the past Monday is not in the dataset.
  // There's no harm in having extra labels.
  const labels: string[] = [];
  for (let i = 13; i >= 0; i--) {
    labels.push(latestDate.subtract(i, 'weeks').format(DATE_FORMAT));
  }
  return labels;
};

export const LANDING_CHART_LABELS = getLabels();
