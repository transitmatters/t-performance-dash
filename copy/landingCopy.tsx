import React from 'react';
import type { LandingCharts } from '../modules/landing/types';

const DESCRIPTION_STYLE = 'text-stone-900 text-lg';
const BASELINE_STYLE = 'text-stone-900 italic text-xs text-center';

//  copy from: https://docs.google.com/document/d/1kpJqbsNrJpW8gqfeuIjd2KplDacQyorAKE2w5wB6HUY/edit

export const SpeedBaseline = <p className={BASELINE_STYLE}>Compared to historical maximums</p>;

export const ServiceBaseline = <p className={BASELINE_STYLE}>Compared to historical maximums </p>;

export const RidershipBaseline = <p className={BASELINE_STYLE}>Compared to historical maximums</p>;

const SpeedDescription = (
  <p className={DESCRIPTION_STYLE}>
    How quickly can riders move through Boston?
    <br />
    <span className="text-sm text-stone-800">
      Speed for a line is the median time to go from the first station to the last divided by the
      distance between those stations. It includes time spent at stops, also known as dwell times.
    </span>
  </p>
);

const ServiceDescription = (
  <p className={DESCRIPTION_STYLE}>
    How long must riders wait for trains and buses?
    <span className="text-sm text-stone-800">
      <br />
      We measure service by daily vehicle trips—the number of times a train or bus makes a complete
      round trip. More service means shorter wait times for riders.
    </span>
  </p>
);

const RidershipDescription = (
  <p className={DESCRIPTION_STYLE}>
    How many riders are using the system?
    <br />
    <span className="text-sm text-stone-800">
      We measure ridership with fare validation data published weekly by the MBTA. Our charts
      include only weekday data.
    </span>
  </p>
);

export const LandingChartCopyMap: { [key in LandingCharts]: React.JSX.Element } = {
  Service: ServiceDescription,
  Speed: SpeedDescription,
  Ridership: RidershipDescription,
};
