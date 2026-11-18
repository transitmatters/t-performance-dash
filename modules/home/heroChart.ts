import dayjs from 'dayjs';
import type { SingleDayDataPoint } from '../../common/types/charts';
import type { Line, LineShort } from '../../common/types/lines';
import type { Station } from '../../common/types/stations';
import { severityForRatio } from '../../common/utils/chartTheme';
import { getParentStationForStopId, stopIdsForStations } from '../../common/utils/stations';

// The hero chart: yesterday's headways on the subway line that ran the most unevenly, measured at a
// central station every branch runs through, in one direction.

export interface HeroStation {
  line: Line;
  lineShort: LineShort;
  /** The page path, as in `/red/trips/single/`. */
  path: string;
  label: string;
  from: Station;
  /** The terminus the trains are heading for, which sets the direction. */
  to: Station;
  stopIds: string[];
}

const station = (
  line: Line,
  lineShort: LineShort,
  path: string,
  label: string,
  fromStopId: string,
  toStopId: string
): HeroStation | undefined => {
  const from = getParentStationForStopId(fromStopId, lineShort);
  const to = getParentStationForStopId(toStopId, lineShort);
  const { fromStopIds } = stopIdsForStations(from, to);
  return from && to && fromStopIds
    ? { line, lineShort, path, label, from, to, stopIds: fromStopIds }
    : undefined;
};

/**
 * Northbound (eastbound on Green and Blue) at each line's downtown station. Red's southbound
 * platform at Park Street has no headway data, so every line uses the same direction to compare
 * fairly.
 */
export const HERO_STATIONS: HeroStation[] = [
  station('line-red', 'Red', 'red', 'Red Line', '70076', '70061'), // Park Street, to Alewife
  station('line-orange', 'Orange', 'orange', 'Orange Line', '70021', '70036'), // Downtown Crossing, to Oak Grove
  station('line-blue', 'Blue', 'blue', 'Blue Line', '70042', '70060'), // State, to Wonderland
  station('line-green', 'Green', 'green', 'Green Line', '70200', '70201'), // Park Street, to Government Center
].filter((s): s is HeroStation => s !== undefined);

/** Fewer judged trips than this, and a line's share means little. */
const MIN_TRIPS = 20;

const ratioOf = (row: SingleDayDataPoint) =>
  row.headway_time_sec && row.benchmark_headway_time_sec
    ? row.headway_time_sec / row.benchmark_headway_time_sec
    : undefined;

/**
 * Bad the way the chart colors it: bunched (half the scheduled gap or less) or 50%+ over it, the
 * red and purple dots.
 */
const isBad = (row: SingleDayDataPoint) => {
  const ratio = ratioOf(row);
  const tone = ratio === undefined ? undefined : severityForRatio(ratio, true)?.tone;
  return tone === 'off50' || tone === 'off100';
};

export interface HeroPick {
  station: HeroStation;
  rows: SingleDayDataPoint[];
  bad: number;
  judged: number;
  /** Index into `rows` of the wait that ran furthest over its schedule, in minutes. */
  worst: number;
}

/** The station whose trains were bad most often, by share so a busier line doesn't win on volume. */
export const pickHero = (
  results: { station: HeroStation; rows: SingleDayDataPoint[] | undefined }[]
): HeroPick | undefined => {
  let best: HeroPick | undefined;
  for (const { station, rows } of results) {
    if (!rows) continue;
    const judged = rows.filter((row) => ratioOf(row) !== undefined);
    if (judged.length < MIN_TRIPS) continue;
    const bad = judged.filter(isBad).length;
    if (best && bad / judged.length <= best.bad / best.judged) continue;
    // By minutes over schedule rather than ratio, which a 1-minute scheduled gap would win.
    const over = (row: SingleDayDataPoint) =>
      row.headway_time_sec && row.benchmark_headway_time_sec
        ? row.headway_time_sec - row.benchmark_headway_time_sec
        : -Infinity;
    const worst = rows.reduce((w, row, i) => (over(row) > over(rows[w]) ? i : w), 0);
    best = { station, rows, bad, judged: judged.length, worst };
  }
  return best;
};

/** Whole minutes, or tenths under 3 so a short scheduled gap doesn't round to 1 or 0. */
const minutes = (seconds: number) => {
  const value = seconds / 60;
  return value < 3 ? `${Math.round(value * 10) / 10}` : `${Math.round(value)}`;
};

/** "14-min wait at 6:05 PM, scheduled every 2.5" */
export const worstLabel = (row: SingleDayDataPoint) => {
  const time = dayjs(row.current_dep_dt).format('h:mm A');
  const scheduled = row.benchmark_headway_time_sec
    ? `, scheduled every ${minutes(row.benchmark_headway_time_sec)}`
    : '';
  return `${minutes(row.headway_time_sec ?? 0)}-min wait at ${time}${scheduled}`;
};
