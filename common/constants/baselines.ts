import type { BusRouteId, CommuterRailRoute, Line } from '../types/lines';

// These are manually chosen based off the peak *monthly* scheduled service. Selecting highest value "
export const PEAK_SCHEDULED_SERVICE = {
  'line-red': 223,
  'line-orange': 161,
  'line-blue': 186,
  'line-green': 506,
  'line-bus': 0,
  DEFAULT: 0,
};

export const PEAK_SPEED = {
  'line-red': 21.2,
  'line-orange': 18,
  'line-blue': 20.5,
  'line-green': 12.6,
  'line-bus': 0,
};

// These are manually chosen based off the peak value. Need to be updated when all data is generated.
export const PEAK_RIDERSHIP: {
  [key in Exclude<Line, 'line-bus'> | BusRouteId | CommuterRailRoute | 'DEFAULT']: number;
} = {
  'line-red': 213703,
  'line-orange': 169578,
  'line-blue': 60129,
  'line-green': 87148,
  '1': 15272,
  '4': 850,
  '9': 7116,
  '15': 6379,
  '16': 6197,
  '1719': 6300,
  '21': 5236,
  '22': 8767,
  '23': 12225,
  '28': 12893,
  '32': 10982,
  '34': 6674,
  '39': 11792,
  '41': 2119,
  '45': 3310,
  '47': 5955,
  '55': 816,
  '57': 11284,
  '6170170': 6988,
  '66': 14505,
  '71': 5789,
  '73': 6616,
  '77': 8015,
  '85': 1189,
  '86': 6850,
  '89': 3963,
  '91': 1942,
  '92': 1459,
  '104109': 8163,
  '111': 11258,
  '114116117': 12867,
  '220221222': 3370,
  'CR-Fitchburg': 9302,
  'CR-Franklin': 11671,
  'CR-Greenbush': 6114,
  'CR-Haverhill': 7112,
  'CR-Lowell': 10925,
  'CR-Worcester': 18637,
  'CR-Fairmount': 2652,
  'CR-Kingston': 6089,
  'CR-Middleborough': 6863,
  'CR-Needham': 6690,
  'CR-Newburyport': 14972,
  'CR-Providence': 25728,
  'line-commuter-rail': 126755,
  DEFAULT: 520580,
};

export const PEAK_COMPLETE_TRIP_TIMES = {
  'line-red': { date: 'May 2020', value: 8374.5 },
  'line-blue': { date: 'May 2020', value: 1860.5 },
  'line-orange': { date: 'May 2020', value: 3776.75 },
  'line-green': { date: 'May 2020', value: 21782 },
  DEFAULT: { date: '', value: 1 },
};
