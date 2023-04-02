import React from 'react';

import { createRedLineDiagram } from '../diagrams';

import type { SegmentRenderOptions } from './LineMap';
import LineMap from './LineMap';

export default {
  title: 'LineMap',
  component: LineMap,
};

const redLine = createRedLineDiagram();
const redLineSegments: SegmentRenderOptions[] = [
  {
    location: {
      fromStationId: 'place-jfk',
      toStationId: 'place-wlsta',
    },
    strokes: [
      { offset: 1, color: 'rgba(255, 0, 0, 0.4)' },
      { offset: -1, color: 'rgba(255, 0, 0, 0.2)' },
    ],
  },
];

export const Testing = () => {
  return (
    <LineMap
      diagram={redLine}
      getStationLabel={(options) => options.stationId}
      strokeOptions={{ color: 'red' }}
      segments={redLineSegments}
    />
  );
};
