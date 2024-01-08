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
export const PEAK_RIDERSHIP = {
  'line-red': 213703,
  'line-orange': 169578,
  'line-blue': 60129,
  'line-green': 87148,
  '1': 15272,
  '9': 7116,
  '15': 6379,
  '16': 6197,
  '22': 8767,
  '23': 12225,
  '28': 12893,
  '32': 10982,
  '39': 11792,
  '57': 14505,
  '66': 14505,
  '71': 5789,
  '73': 6616,
  '77': 8015,
  '111': 11258,
  '114116117': 12867,
  '220221222': 3370,
  DEFAULT: 520580,
};

export const PEAK_COMPLETE_TRIP_TIMES = {
  'line-red': { date: 'May 2020', value: 8374.5 },
  'line-blue': { date: 'May 2020', value: 1860.5 },
  'line-orange': { date: 'May 2020', value: 3776.75 },
  'line-green': { date: 'May 2020', value: 21782 },
  DEFAULT: { date: '', value: 1 },
};
