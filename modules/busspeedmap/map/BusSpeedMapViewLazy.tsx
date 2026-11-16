import { Suspense, lazy } from 'react';
import type { ComponentProps } from 'react';
import { Skeleton } from '../../../common/components/ui/skeleton';
import { useThemeStore } from '../../../common/state/themeStore';

// Keeps the ~230KB MapLibre library in a chunk only pulled down by whatever actually renders a
// map -- shared by the full speed map page and the segment leaderboard's single-segment dialog.
const BusSpeedMapView = lazy(() =>
  import('./BusSpeedMapView').then((module) => ({ default: module.BusSpeedMapView }))
);

export const BusSpeedMapViewLazy = (props: ComponentProps<typeof BusSpeedMapView>) => {
  // A new map for a new theme: swapping the basemap style in place drops the arrow image and
  // re-adds the speed layers out of order.
  const theme = useThemeStore((state) => state.theme);
  return (
    // Fills the box the map will, so the page doesn't jump when it arrives.
    <Suspense fallback={<Skeleton className="h-full w-full" />}>
      <BusSpeedMapView key={theme} {...props} />
    </Suspense>
  );
};
