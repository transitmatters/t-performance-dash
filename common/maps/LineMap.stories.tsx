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
      fromStationId: 'place-pktrm',
    },
    strokes: [
      { offset: 1, stroke: 'red', opacity: 0.1 },
      { offset: -1, stroke: 'red', opacity: 0.3 },
      { offset: -2, stroke: 'red', opacity: 0.6 },
      { offset: -3, stroke: 'red', opacity: 0.8 },
    ],
    labels: {
      '0': {
        widthWhenVertical: 40,
        heightWhenHorizontal: 40,
        content: (
          <div style={{ fontSize: 4 }}>
            Greetings amigos thank you for inviting me into your SVG
          </div>
        ),
      },
      '1': {
        widthWhenVertical: 40,
        heightWhenHorizontal: 40,
        content: (
          <div style={{ fontSize: 4 }}>And on this side too! I also like being on this side!</div>
        ),
      },
    },
  },
  {
    location: {
      toStationId: 'place-pktrm',
      fromStationId: 'place-shmnl',
    },
    strokes: [
      { offset: 1, stroke: 'red', opacity: 0.3 },
      { offset: 2, stroke: 'red', opacity: 0.6 },
      { offset: 3, stroke: 'red', opacity: 0.8 },
    ],
  },
];

export const Testing = () => {
  return (
    <>
      <LineMap
        direction="horizontal"
        diagram={redLine}
        getStationLabel={(options) => options.stationId}
        strokeOptions={{ stroke: 'red' }}
        segments={redLineSegments}
      />
      <LineMap
        direction="vertical"
        diagram={redLine}
        getStationLabel={(options) => options.stationId}
        strokeOptions={{ stroke: 'red' }}
        segments={redLineSegments}
      />
    </>
  );
};
