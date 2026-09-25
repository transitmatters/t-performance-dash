import React from 'react';
import dynamic from 'next/dynamic';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';

// MapLibre reaches for WebGL as soon as it loads, so it must stay out of the static export's
// Node prerender. This also keeps the ~230KB library in a chunk only pulled down by whatever
// actually renders a map -- shared by the full speed map page and the segment leaderboard's
// single-segment dialog, so neither has to redeclare the dynamic-import/SSR dance.
export const BusSpeedMapViewLazy = dynamic(
  () => import('./BusSpeedMapView').then((module) => module.BusSpeedMapView),
  { ssr: false, loading: () => <ChartPlaceHolder /> }
);
