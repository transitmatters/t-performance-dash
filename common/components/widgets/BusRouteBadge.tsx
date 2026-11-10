import { useChartBusRoute } from '../../hooks/useChartBusRoute';
import { Badge } from '../ui/badge';

/** "Route 1" in bus yellow, for a chart title. Renders nothing off bus pages or on a many-route view. */
export const BusRouteBadge = () => {
  const busRoute = useChartBusRoute();
  if (!busRoute) return null;
  return (
    <Badge className="bg-mbta-bus text-sm font-semibold text-stone-900">Route {busRoute}</Badge>
  );
};
