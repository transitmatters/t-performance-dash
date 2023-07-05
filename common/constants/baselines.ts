// These are manually chosen based off the peak *monthly* scheduled service. Selecting highest value "
export const PEAK_SCHEDULED_SERVICE = {
  'line-red': 223,
  'line-orange': 161,
  'line-blue': 186,
  'line-green': 499,
  'line-bus': 0,
  DEFAULT: 0,
};

export const PEAK_SPEED = {
  'line-red': 21.4,
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
  '1': 15000,
  '15': 15000,
  '22': 15000,
  '23': 15000,
  '28': 15000,
  '32': 15000,
  '39': 15000,
  '57': 15000,
  '66': 15000,
  '71': 15000,
  '73': 15000,
  '77': 15000,
  '111': 15000,
  '114116117': 15000,
  DEFAULT: 0,
};

export const PEAK_COMPLETE_TRIP_TIMES = {
  'line-red': { date: 'May 2020', value: 8374.5 },
  'line-blue': { date: 'May 2020', value: 1860.5 },
  'line-orange': { date: 'May 2020', value: 3776.75 },
  'line-green': { date: 'May 2020', value: 21782 },
  DEFAULT: { date: '', value: 1 },
};
