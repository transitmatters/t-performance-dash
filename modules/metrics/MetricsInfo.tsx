import React from 'react';
import { Layout } from '../../common/layouts/layoutTypes';

export const MetricsInfo = () => {
  return (
    <div className="flex flex-col gap-8 p-8">
      <h1 className="text-3xl font-thin">Our metrics</h1>
      <div>
        <h2 className="text-5xl font-thin">Slow Zones</h2>
        <p className="max-w-md">
          To calculate slow zones, we look at the daily median travel time + dwell time for each
          segment along a route. Whenever that trip time is at least 10% slower than the baseline
          for 4 or more days in a row, it gets flagged as a slow zone. Currently, our baseline is
          the median value in our data, which goes back to 2016. It's not a perfect system: you may
          find some anomalies, but we think it works pretty well.
        </p>
      </div>
      <div>
        <h2 className="text-5xl font-thin">Speed</h2>
        <p className="max-w-md">
          Speed for a line is the median time to go from the first station to the last divided by
          the distance between those stations. It includes time spent at stops, also known as dwell
          times.
        </p>
      </div>
      <div>
        <h2 className="text-5xl font-thin">Service</h2>
        <p className="max-w-md">
          Service is the number of round trips over the course of the day on a given line. We
          measure "delivered" and "scheduled" service. The actual number of trains ran is the
          delivered, and we use the MBTA's{' '}
          <a href="https://gtfs.org/" className="text-blue-600">
            GTFS
          </a>{' '}
          data to get scheduled trips.
        </p>
      </div>
      <div>
        <h2 className="text-5xl font-thin">Ridership</h2>
        <p className="max-w-md">
          We measure ridership with fare validation data published weekly by the MBTA. Our charts
          include only weekday data.
        </p>
      </div>
    </div>
  );
};

MetricsInfo.Layout = Layout.Landing;
