import type { RidershipCount } from '../types/dataPoints';

/**
 * Ridership's "historical maximum" compared against the same time of year (#938). Ridership dips
 * every December, Thanksgiving and school vacation, so a single all-time maximum makes those weeks
 * look like a collapse even before the pandemic. Each week is instead compared with the most riders
 * in the same week of the year, across the weeks the published baseline searched.
 *
 * Holidays move between ISO weeks from year to year (Thanksgiving was in week 47 in 2018 and week
 * 48 in 2019), so a week with a weekday holiday is matched to that holiday's week in other years,
 * and every other week to the same ISO week number.
 */

const DAY_MS = 86_400_000;

// Dates are plain YYYY-MM-DD strings, so do the arithmetic in UTC, where no day is 23 or 25 hours.
const toUtc = (date: string) => {
  const [year, month, day] = date.slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day);
};

/** 0 for Monday through 6 for Sunday. */
const weekday = (utc: number) => (new Date(utc).getUTCDay() + 6) % 7;

const startOfWeek = (utc: number) => utc - weekday(utc) * DAY_MS;

const nthWeekday = (year: number, month: number, day: number, n: number) => {
  const first = Date.UTC(year, month, 1);
  return first + (((day - weekday(first) + 7) % 7) + 7 * (n - 1)) * DAY_MS;
};

const lastWeekday = (year: number, month: number, day: number) => {
  const last = Date.UTC(year, month + 1, 0);
  return last - ((weekday(last) - day + 7) % 7) * DAY_MS;
};

/** A Saturday holiday is observed the Friday before, and a Sunday one the Monday after. */
const observed = (utc: number) =>
  weekday(utc) === 5 ? utc - DAY_MS : weekday(utc) === 6 ? utc + DAY_MS : utc;

// Weekday holidays that lower ridership. The Monday holidays in February and April also start
// Massachusetts school vacation weeks.
const holidaysIn = (year: number): [name: string, utc: number][] => [
  ["New Year's", observed(Date.UTC(year, 0, 1))],
  ['Martin Luther King Jr. Day', nthWeekday(year, 0, 0, 3)],
  ["Presidents' Day", nthWeekday(year, 1, 0, 3)],
  ["Patriots' Day", nthWeekday(year, 3, 0, 3)],
  ['Memorial Day', lastWeekday(year, 4, 0)],
  ['Juneteenth', observed(Date.UTC(year, 5, 19))],
  ['Independence Day', observed(Date.UTC(year, 6, 4))],
  ['Labor Day', nthWeekday(year, 8, 0, 1)],
  ["Indigenous Peoples' Day", nthWeekday(year, 9, 0, 2)],
  ['Veterans Day', observed(Date.UTC(year, 10, 11))],
  ['Thanksgiving', nthWeekday(year, 10, 3, 4)],
  ['Christmas', observed(Date.UTC(year, 11, 25))],
];

const isoWeekNumber = (utc: number) => {
  // The ISO week is the one holding its Thursday, and week 1 holds the year's first Thursday.
  const thursday = utc + (3 - weekday(utc)) * DAY_MS;
  const yearStart = Date.UTC(new Date(thursday).getUTCFullYear(), 0, 1);
  return Math.floor((thursday - yearStart) / DAY_MS / 7) + 1;
};

export interface Season {
  /** What weeks are matched on: the holiday if there is one, otherwise `week`. */
  key: string;
  /** The ISO week number, as a key. */
  week: string;
  /** The weekday holiday in this week, if there is one. */
  holiday?: string;
}

/** The time of year a date's Monday-to-Friday week falls in. */
export const getSeason = (date: string): Season => {
  const monday = startOfWeek(toUtc(date));
  const friday = monday + 4 * DAY_MS;
  // A week starting in late December can hold the next year's New Year's Day.
  const year = new Date(monday).getUTCFullYear();
  // Week 53 only happens every five or six years, so it borrows week 52's history.
  const week = `week-${Math.min(isoWeekNumber(monday), 52)}`;
  for (const [name, utc] of [...holidaysIn(year), ...holidaysIn(year + 1)]) {
    if (utc >= monday && utc <= friday) return { key: name, week, holiday: name };
  }
  return { key: week, week };
};

/**
 * The most riders in each season, using the weeks that ended on or before `cutoff`.
 *
 * Bucketed the way data-ingestion builds baselines.json: a week's Monday record when it has one
 * (bus routes have stray mid-week records that run up to twice the usual level), otherwise the
 * average of its records. Missing and zero weeks are service gaps, not measurements.
 */
export const getSeasonalMaximums = (
  history: RidershipCount[],
  cutoff: string
): Map<string, number> => {
  const lastMonday = toUtc(cutoff) - 6 * DAY_MS;
  const weeks = new Map<number, { monday?: number; values: number[] }>();
  for (const { date, count } of history) {
    if (count == null || !Number.isFinite(count) || count <= 0) continue;
    const utc = toUtc(date);
    const monday = startOfWeek(utc);
    if (monday > lastMonday) continue;
    const week = weeks.get(monday) ?? { values: [] };
    week.values.push(count);
    if (utc === monday) week.monday = count;
    weeks.set(monday, week);
  }

  const maximums = new Map<string, number>();
  for (const [monday, week] of weeks) {
    const value = week.monday ?? week.values.reduce((sum, v) => sum + v, 0) / week.values.length;
    const { key, week: weekKey } = getSeason(new Date(monday).toISOString());
    // A holiday week also counts toward its ISO week. Labor Day fell in week 36 every year from 2018
    // to 2023 except 2020, so without this, an ordinary week 36 (2026's, before a late Labor Day)
    // would be measured against a single lockdown week. A holiday week runs a little low, so it only
    // sets the maximum when the ordinary weeks are missing or far lower.
    for (const k of new Set([key, weekKey])) {
      maximums.set(k, Math.max(maximums.get(k) ?? 0, value));
    }
  }
  return maximums;
};

export interface SeasonalMaximum {
  value: number;
  /** What the value is the maximum for, e.g. "Christmas week" or "this time of year". */
  season: string;
}

export const getSeasonalMaximum = (
  maximums: Map<string, number>,
  date: string
): SeasonalMaximum | undefined => {
  const { key, holiday } = getSeason(date);
  const value = maximums.get(key);
  if (!value) return undefined;
  return { value, season: holiday ? `${holiday} week` : 'this time of year' };
};
