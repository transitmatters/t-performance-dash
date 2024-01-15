import { flatten } from 'lodash';
import type { Location } from '../types/charts';
import { DeliveredTripMetrics, TimePredictionWeek } from '../types/dataPoints';

const directionAbbrs = {
  northbound: 'NB',
  southbound: 'SB',
  eastbound: 'EB',
  westbound: 'WB',
  inbound: 'IB',
  outbound: 'OB',
};

type GetCsvFilenameOptions = {
  datasetName: string;
  startDate: string;
  endDate?: string;
  line?: string;
  location?: Location;
  includeBothStopsForLocation?: boolean | undefined;
}

export function getCsvFilename(
  options: GetCsvFilenameOptions
) {
  const {datasetName, startDate, endDate, line, location, includeBothStopsForLocation} = options
  // CharlesMGH-SB_dwells_20210315.csv
  // CentralSquareCambridge-MelneaCassWashington_traveltimesByHour-weekday_20200101-20201231.csv
  // BostonUniversityWest-EB_headways_20161226-20170328.csv
  const fromStop = location?.from.replace(/[^A-z]/g, '');
  const toStop = location?.to.replace(/[^A-z]/g, '');
  const dir = location && directionAbbrs[location.direction];

  //Location does not exist on all widgets - in that case, 'where' will just be the name of the line
  const where = location ? `${fromStop}-${includeBothStopsForLocation ? toStop : dir}` : line;
  const what = datasetName;
  const date1 = startDate.replaceAll('-', '');
  const date2 = endDate ? `-${endDate.replaceAll('-', '')}` : '';
  const when = `${date1}${date2}`;

  return `${where}_${what}_${when}.csv`;
}

export const addAccuracyPercentageToData = (data: TimePredictionWeek[]) => {
  const predictionsList = flatten(data.map(({ prediction }) => prediction));

  const newData = predictionsList.map((item) => {
    const accuracyPercentage = (item?.num_accurate_predictions / item?.num_predictions) * 100;
    return { ...item, accuracy_percentage: accuracyPercentage.toFixed(1) };
  });

  return newData;
};

export const addMPHToSpeedData = (data: DeliveredTripMetrics[]) => {
  const newData = data.map((item) => {
    const hours = item.total_time / 3600;
    const mph = item.miles_covered / hours;
    return { ...item, miles_per_hour: mph.toFixed(1) };
  });

  return newData;
};
