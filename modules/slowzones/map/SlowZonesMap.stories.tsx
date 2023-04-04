import React from 'react';

import type { SlowZoneResponse } from '../../../common/types/dataPoints';
import slowZonesResponses from '../../../public/static/slowzones/all_slow.json';

import SlowZonesMap from './SlowZonesMap';

export default {
  title: 'SlowZonesMap',
  component: SlowZonesMap,
};

export const Primary = () => {
  return (
    <>
      <SlowZonesMap
        lineName="Red"
        slowZones={slowZonesResponses as SlowZoneResponse[]}
        direction="horizontal"
      />
      <SlowZonesMap
        lineName="Red"
        slowZones={slowZonesResponses as SlowZoneResponse[]}
        direction="vertical"
      />
    </>
  );
};
