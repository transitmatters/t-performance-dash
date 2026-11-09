import { Link } from '../../../common/components/general/Link';
import { getBusSpeedMapRouteHref, useDelimitatedRoute } from '../../../common/utils/router';
import type { LeaderboardRankBy } from '../types';
import type { GroupedBusSpeedLeaderboardEntry } from '../utils';
import { leaderboardHeadwayShare } from '../utils';

interface BusSpeedRouteLeaderboardProps {
  data: GroupedBusSpeedLeaderboardEntry[];
  rankBy: LeaderboardRankBy;
}

const HEADWAY_LABELS = { bunched: 'bunched', reliability: 'within 75–125%' };

const formatValue = (entry: GroupedBusSpeedLeaderboardEntry, rankBy: LeaderboardRankBy) => {
  if (rankBy === 'speed')
    return `${(entry.miles_covered / (entry.total_time / 3600)).toFixed(1)} mph`;
  return `${leaderboardHeadwayShare(entry, rankBy)?.toFixed(1)}% ${HEADWAY_LABELS[rankBy]}`;
};

export const BusSpeedRouteLeaderboard = ({ data, rankBy }: BusSpeedRouteLeaderboardProps) => {
  const route = useDelimitatedRoute();

  return (
    <ol className="flex flex-col divide-y divide-stone-200">
      {data.map((entry, index) => {
        return (
          <li key={entry.route}>
            <Link
              href={getBusSpeedMapRouteHref(entry.route, route)}
              className="flex items-center justify-between gap-4 py-2 text-sm hover:bg-stone-50"
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-right text-stone-400">{index + 1}</span>
                <span className="font-semibold text-stone-900">Route {entry.route}</span>
              </span>
              <span className="font-semibold text-stone-900">{formatValue(entry, rankBy)}</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};
