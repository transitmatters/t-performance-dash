import { Link } from '../../../common/components/general/Link';
import { getBusSpeedMapRouteHref, useDelimitatedRoute } from '../../../common/utils/router';
import type { LeaderboardMetricConfig } from '../types';
import type { RankedBusRoute } from '../utils';

interface BusSpeedRouteLeaderboardProps {
  data: RankedBusRoute[];
  metric: LeaderboardMetricConfig;
  /** False for routes listed without a rank, such as those a metric sets aside. */
  numbered?: boolean;
}

export const BusSpeedRouteLeaderboard = ({
  data,
  metric,
  numbered = true,
}: BusSpeedRouteLeaderboardProps) => {
  const route = useDelimitatedRoute();

  return (
    <ol className="flex flex-col divide-y divide-border">
      {data.map((entry, index) => (
        <li key={entry.route}>
          <Link
            href={getBusSpeedMapRouteHref(entry.route, route)}
            className="flex items-center justify-between gap-4 py-2 text-sm hover:bg-muted"
          >
            <span className="flex items-center gap-3">
              {/* Kept when unnumbered, so the routes line up with a ranked list above. */}
              <span className="w-5 text-right text-muted-foreground">
                {numbered ? index + 1 : null}
              </span>
              <span className="font-semibold text-foreground">Route {entry.route}</span>
            </span>
            {/* The detail sits under the figure on phones, where a long route name leaves no
                room beside it. */}
            <span className="flex flex-col items-end text-right sm:flex-row sm:items-baseline sm:gap-3">
              <span className="font-semibold text-foreground tabular-nums sm:order-last sm:min-w-12">
                {metric.format(entry.value)}
              </span>
              {entry.detail && (
                <span className="text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                  {entry.detail}
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
};
