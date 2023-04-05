import React from 'react';

import type { SlowZoneResponse } from '../../../common/types/dataPoints';

import SlowZonesMap from './SlowZonesMap';

export default {
  title: 'SlowZonesMap',
  component: SlowZonesMap,
};

const slowZonesResponses: SlowZoneResponse[] = [
  {
    color: 'Red',
    fr_id: '70061',
    to_id: '70063',
    start: '2023-03-12T00:00:00Z',
    end: '2023-04-01T00:00:00Z',
    delay: 42.5,
    mean_metric: 172.929,
    baseline: 135.0,
    duration: 20,
  },
  {
    color: 'Red',
    fr_id: '70063',
    to_id: '70061',
    start: '2023-03-12T00:00:00Z',
    end: '2023-04-01T00:00:00Z',
    delay: 90,
    mean_metric: 172.929,
    baseline: 135.0,
    duration: 20,
  },
];

export const Primary = () => {
  return (
    <>
      <SlowZonesMap
        lineName="Red"
        slowZones={slowZonesResponses}
        direction="horizontal"
        speedRestrictions={[]}
      />
      <SlowZonesMap
        lineName="Red"
        slowZones={slowZonesResponses}
        direction="vertical"
        speedRestrictions={[]}
      />
    </>
  );
};
