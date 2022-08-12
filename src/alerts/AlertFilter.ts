import { Alert } from './types';

const known = [
  /[Uu]p to ([0-9]+) min/, // "Up to 15 minutes"
  /([0-9]+) min/, // "15 minutes"
  /[A-Za-z]+ speeds/, // "Reduced speeds"
  /delay/,
  /notice/,
  /[Ss]huttle/, // might want to worry about this one...
];

// TODO: audit this. Like, list all the alerts
// to see what filters are actually accurate
const anti = [
  / stop .* move /i, // "The stop X will permanently move to Y"
  /temporary stop/,
];

/**
 * Given an alert object, findMatch returns a boolean with whether or not the alert is a known format
 * like "Reduced speeds" or "Up to 15 minutes"
 */
export const findMatch = (alert: Alert) => {
  const text = alert.text;

  if (anti.some((exp) => text.match(exp))) {
    return false;
  }
  return known.some((exp) => text.match(exp));
};
