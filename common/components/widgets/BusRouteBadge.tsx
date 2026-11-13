import { useChartBusRoute } from '../../hooks/useChartBusRoute';

/**
 * The route number on a bus-yellow tile, like an MBTA bus stop sign, for a chart title. The page
 * header already says "Route 1", so the tile only needs the number. Renders nothing off bus pages
 * or on a many-route view.
 */
export const BusRouteBadge = () => {
  const busRoute = useChartBusRoute();
  if (!busRoute) return null;
  return (
    <span
      className="inline-flex h-6 min-w-7 shrink-0 items-center justify-center self-center rounded-md bg-mbta-bus px-1.5 text-base font-bold whitespace-nowrap text-stone-900"
      aria-label={`Route ${busRoute}`}
    >
      {busRoute}
    </span>
  );
};
