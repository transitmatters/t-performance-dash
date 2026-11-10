import { Link } from '../../../common/components/general/Link';
import { getBusSpeedMapRouteHref, useDelimitatedRoute } from '../../../common/utils/router';
import type { LeaderboardMetricConfig } from '../types';
import type { RankedBusRoute } from '../utils';

interface BusSpeedRouteLeaderboardProps {
  data: RankedBusRoute[];
  metric: LeaderboardMetricConfig;
}

export const BusSpeedRouteLeaderboard = ({ data, metric }: BusSpeedRouteLeaderboardProps) => {
  const route = useDelimitatedRoute();

  return (
    <ol className="flex flex-col divide-y divide-stone-200">
      {data.map((entry, index) => (
        <li key={entry.route}>
          <Link
            href={getBusSpeedMapRouteHref(entry.route, route)}
            className="flex items-center justify-between gap-4 py-2 text-sm hover:bg-stone-50"
          >
            <span className="flex items-center gap-3">
              <span className="w-5 text-right text-stone-400">{index + 1}</span>
              <span className="font-semibold text-stone-900">Route {entry.route}</span>
            </span>
            <span className="font-semibold text-stone-900">{metric.format(entry.value)}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
};
