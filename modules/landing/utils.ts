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

const getDatasetOptions = (line: Line): Partial<ChartDataset<'line'>> => {
  return {
    pointRadius: 4,
    borderColor: LINE_COLORS[line ?? 'default'],
    borderWidth: 4,
    pointBackgroundColor: LINE_COLORS[line ?? 'default'],
    pointBorderWidth: 0,
    tension: 0,
    pointHoverRadius: 6,
    spanGaps: true,
    pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
  };
};

export const convertToSpeedDataset = (data: DeliveredTripMetrics[]) => {
  const { line } = data[0];
  const datasetOptions = getDatasetOptions(line);
  return {
    ...datasetOptions,
    label: `% of peak`,
    data: data.map((datapoint) =>
      datapoint.miles_covered
        ? round(
            (100 * datapoint.miles_covered) / (datapoint.total_time / 3600) / PEAK_SPEED[line],
            1
          )
        : Number.NaN
    ),
  };
};

export const convertToServiceDataset = (data: DeliveredTripMetrics[]) => {
  const { line } = data[0];
  const datasetOptions = getDatasetOptions(line);

  return {
    ...datasetOptions,
    label: `% of peak`,
    data: data.map((datapoint) =>
      datapoint.miles_covered
        ? round((100 * datapoint.count) / PEAK_SCHEDULED_SERVICE[line], 1)
        : Number.NaN
    ),
  };
};

export const convertToRidershipDataset = (data: RidershipCount[], line: Line) => {
  const datasetOptions = getDatasetOptions(line);

  return {
    ...datasetOptions,
    label: `% of peak`,
    data: data.map((datapoint) =>
      datapoint.count
        ? Math.round(10 * 100 * (datapoint.count / PEAK_RIDERSHIP[line])) / 10
        : Number.NaN
    ),
  };
};
