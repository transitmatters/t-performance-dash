import type { Location } from '../types/charts';

const directionAbbrs = {
  northbound: 'NB',
  southbound: 'SB',
  eastbound: 'EB',
  westbound: 'WB',
  inbound: 'IB',
  outbound: 'OB',
};

export function getCsvFilename(
  datasetName: string,
  bothStops: boolean,
  startDate: string,
  line?: string,
  location?: Location,
  endDate?: string
) {
  // CharlesMGH-SB_dwells_20210315.csv
  // CentralSquareCambridge-MelneaCassWashington_traveltimesByHour-weekday_20200101-20201231.csv
  // BostonUniversityWest-EB_headways_20161226-20170328.csv
  const fromStop = location?.from.replace(/[^A-z]/g, '');
  const toStop = location?.to.replace(/[^A-z]/g, '');
  const dir = location && directionAbbrs[location.direction];

  //Location does not exist on all widgets - in that case, 'where' will just be the name of the line
  const where = location ? `${fromStop}-${bothStops ? toStop : dir}` : line;
  const what = datasetName;
  const date1 = startDate.replaceAll('-', '');
  const date2 = endDate ? `-${endDate.replaceAll('-', '')}` : '';
  const when = `${date1}${date2}`;

  return `${where}_${what}_${when}.csv`;
}
