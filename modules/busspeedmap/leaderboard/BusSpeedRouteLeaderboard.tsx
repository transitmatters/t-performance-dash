import React from 'react';
import Link from 'next/link';
import type { BusSpeedLeaderboardEntry } from '../../../common/types/dataPoints';
import { getBusRouteSelectionItemHref, useDelimitatedRoute } from '../../../common/utils/router';

interface BusSpeedRouteLeaderboardProps {
  data: BusSpeedLeaderboardEntry[];
}

export const BusSpeedRouteLeaderboard: React.FC<BusSpeedRouteLeaderboardProps> = ({ data }) => {
  const route = useDelimitatedRoute();

  return (
    <ol className="flex flex-col divide-y divide-stone-200">
      {data.map((entry, index) => {
        const mph = entry.miles_covered / (entry.total_time / 3600);
        return (
          <li key={entry.route}>
            <Link
              href={getBusRouteSelectionItemHref(entry.route, route)}
              className="flex items-center justify-between gap-4 py-2 text-sm hover:bg-stone-50"
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-right text-stone-400">{index + 1}</span>
                <span className="font-semibold text-stone-900">Route {entry.route}</span>
              </span>
              <span className="font-semibold text-stone-900">{mph.toFixed(1)} mph</span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
};
