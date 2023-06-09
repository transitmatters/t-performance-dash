import {
  PEAK_COMPLETE_TRIP_TIMES,
  PEAK_RIDERSHIP,
  PEAK_SCHEDULED_SERVICE,
} from '../../common/constants/baselines';
import { LINE_COLORS } from '../../common/constants/colors';
import type { RidershipCount, SpeedDataPoint } from '../../common/types/dataPoints';
import type { Line } from '../../common/types/lines';

const getDatasetOptions = (line: Line) => {
  return {
    borderColor: LINE_COLORS[line ?? 'default'],
    borderWidth: 6,
    pointBackgroundColor: 'transparent',
    pointBorderWidth: 0,
    tension: 0.5,
    pointHoverRadius: 8,
    spanGaps: false,
    pointHoverBackgroundColor: LINE_COLORS[line ?? 'default'],
  };
};

export const convertToSpeedDataset = (data: SpeedDataPoint[]) => {
  const { line } = data[0];
  const datasetOptions = getDatasetOptions(line);
  return {
    ...datasetOptions,
    label: `% of baseline`,
    data: data.map((datapoint) =>
      datapoint.value
        ? Math.round(
            10 *
              (100 *
                (1 / datapoint.value / (1 / PEAK_COMPLETE_TRIP_TIMES[line ?? 'DEFAULT'].value)))
          ) / 10
        : Number.NaN
    ),
  };
};

export const convertToServiceDataset = (data: SpeedDataPoint[]) => {
  const { line } = data[0];
  const datasetOptions = getDatasetOptions(line);

  return {
    ...datasetOptions,
    label: `% of baseline`,
    data: data.map((datapoint) =>
      datapoint.value
        ? Math.round((10 * (100 * (datapoint.count / 2))) / PEAK_SCHEDULED_SERVICE[line]) / 10
        : Number.NaN
    ),
  };
};

export const convertToRidershipDataset = (data: RidershipCount[], line: Line) => {
  const datasetOptions = getDatasetOptions(line);

  return {
    ...datasetOptions,
    label: `% of baseline`,
    data: data.map((datapoint) =>
      datapoint.count ? 100 * (datapoint.count / PEAK_RIDERSHIP[line]) : Number.NaN
    ),
  };
};
