import { Suspense, lazy } from 'react';
import type { ComponentProps } from 'react';
import { ChartPlaceHolder } from '../../../common/components/graphics/ChartPlaceHolder';

// Keeps the ~230KB MapLibre library in a chunk only pulled down by whatever actually renders a
// map -- shared by the full speed map page and the segment leaderboard's single-segment dialog.
const BusSpeedMapView = lazy(() =>
  import('./BusSpeedMapView').then((module) => ({ default: module.BusSpeedMapView }))
);

export const BusSpeedMapViewLazy = (props: ComponentProps<typeof BusSpeedMapView>) => (
  <Suspense fallback={<ChartPlaceHolder />}>
    <BusSpeedMapView {...props} />
  </Suspense>
);
