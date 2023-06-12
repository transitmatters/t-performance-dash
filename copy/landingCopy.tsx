import React from 'react';
import type { LandingCharts } from '../modules/landing/types';

const DESCRIPTION_STYLE = 'text-gray-100';

export const TopLevelMetrics: React.JSX.Element = (
  <p className="max-w-lg italic">
    Our line metrics are presented here as a percentage of <b>baseline</b>. Baseline is the highest
    monthly median value for the metric since data is available (Jan. 15, 2016).
  </p>
);

export const SpeedDescription = (
  <p className={DESCRIPTION_STYLE}>
    How quickly can riders move through Boston? <br />
    <br /> This is presented as a weekly average in miles per hour. It's calculated across the
    entire line: in all directions, including dwell times, from first departure to last arrival.
  </p>
);

export const ServiceDescription = (
  <p className={DESCRIPTION_STYLE}>
    How long do riders have to wait for a train? <br />
    <br />
    This is measured in daily vehicle trips, or the number of times a train or bus makes the
    complete round trip with passengers. More service mean shorter wait times, fewer crowded cars,
    and faster travel times overall.
  </p>
);

export const RidershipDescription = (
  <p className={DESCRIPTION_STYLE}>
    How are riders responding to the experience offered by the T? <br />
    <br />
    This is measured in one-way trips (every time a passenger taps their fare card), and presented
    as daily totals.
  </p>
);

export const LandingChartCopyMap: { [key in LandingCharts]: React.JSX.Element } = {
  Service: ServiceDescription,
  Speed: SpeedDescription,
  Ridership: RidershipDescription,
};
