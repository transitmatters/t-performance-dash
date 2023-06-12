import React from 'react';
import Link from 'next/link';
import type { LandingCharts } from '../modules/landing/types';
import { SYSTEM_DEFAULTS } from '../common/state/defaults/dateDefaults';
const DESCRIPTION_STYLE = 'text-gray-100 text-lg';
const BASELINE_STYLE = 'text-gray-100 italic text-xs text-center';

export const SpeedBaseline = (
  <p className={BASELINE_STYLE}>
    Baseline speed is the calendar month with the highest average daily speed per line.
  </p>
);

export const ServiceBaseline = (
  <p className={BASELINE_STYLE}>
    Baseline service is the calendar month with the highest average daily service per line.
  </p>
);

export const RidershipBaseline = (
  <p className={BASELINE_STYLE}>
    Baseline ridership is the four-week period with the highest average <b>weekly</b> ridership per
    line.
  </p>
);

export const SpeedDescription = (
  <p className={DESCRIPTION_STYLE}>
    How quickly can riders move through Boston?
    <br />
    <span className="text-sm text-gray-200">
      Speed is the rate at which trains move. It's calculated across the entire line and includes
      time spent stopped. Speed is heavily influenced by{' '}
      <Link
        className="text-blue-500"
        href={{ pathname: '/system/slowzones', query: SYSTEM_DEFAULTS.systemConfig }}
      >
        slow zones
      </Link>
      .
    </span>
  </p>
);

export const ServiceDescription = (
  <p className={DESCRIPTION_STYLE}>
    How long must riders wait for trains and buses?
    <span className="text-sm text-gray-200">
      <br />
      Service is measured in daily vehicle trips, or the number of times a train or bus makes a
      complete round trip. More service means shorter wait times for riders.
    </span>
  </p>
);

export const RidershipDescription = (
  <p className={DESCRIPTION_STYLE}>
    How many riders are using the system?
    <br />
    <span className="text-sm text-gray-200">
      Ridership is measured in one-way trips (every time a rider pays a fare), and published weekly
      by the MBTA.
    </span>
  </p>
);

export const LandingChartCopyMap: { [key in LandingCharts]: React.JSX.Element } = {
  Service: ServiceDescription,
  Speed: SpeedDescription,
  Ridership: RidershipDescription,
};
