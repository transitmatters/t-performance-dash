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
      toStationId: 'place-cntsq',
      fromStationId: 'place-wlsta',
    },
    strokes: [
      { offset: 1, stroke: 'red', opacity: 0.1 },
      { offset: -1, stroke: 'red', opacity: 0.2 },
    ],
  },
];

export const Testing = () => {
  return (
    <LineMap
      diagram={redLine}
      getStationLabel={(options) => options.stationId}
      strokeOptions={{ stroke: 'red' }}
      segments={redLineSegments}
    />
  );
};
