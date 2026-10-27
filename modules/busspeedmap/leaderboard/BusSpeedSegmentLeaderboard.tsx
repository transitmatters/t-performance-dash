import { getBusRouteDisplayName } from '../../../common/constants/lines';
import type { BusSpeedSegmentLeaderboardEntry } from '../types';
import { segmentDistanceAndTime } from '../utils';

interface BusSpeedSegmentLeaderboardProps {
  data: BusSpeedSegmentLeaderboardEntry[];
  onSelectSegment: (entry: BusSpeedSegmentLeaderboardEntry) => void;
}

export const BusSpeedSegmentLeaderboard = ({
  data,
  onSelectSegment,
}: BusSpeedSegmentLeaderboardProps) => {
  return (
    <ol className="flex flex-col divide-y divide-stone-200">
      {data.map((entry, index) => (
        <li
          key={`${entry.route_id}-${entry.direction_id}-${entry.from_stop_name}-${entry.to_stop_name}`}
        >
          <button
            type="button"
            onClick={() => onSelectSegment(entry)}
            className="flex w-full items-center justify-between gap-4 py-2 text-left text-sm hover:bg-stone-50"
          >
            <span className="flex items-start gap-3">
              <span className="w-5 shrink-0 text-right text-stone-400">{index + 1}</span>
              <span className="flex flex-col">
                <span>
                  <span className="font-semibold text-stone-900">
                    Route {getBusRouteDisplayName(entry.route_id)}
                  </span>
                  <span className="text-stone-600">
                    {' '}
                    · {entry.direction_id === 1 ? 'Inbound' : 'Outbound'}
                  </span>
                </span>
                <span className="text-stone-600">
                  {entry.from_stop_name} → {entry.to_stop_name}
                </span>
                <span className="text-xs text-stone-400">
                  Median of {entry.n_traversals} trips
                  {entry.n_interpolated > 0 &&
                    `, ${entry.n_interpolated} with an interpolated stop time`}
                </span>
              </span>
            </span>
            <span className="flex shrink-0 flex-col items-end">
              <span className="font-semibold text-stone-900">
                {entry.p50_speed_mph.toFixed(1)} mph
              </span>
              {segmentDistanceAndTime(entry) && (
                <span className="text-xs text-stone-500">{segmentDistanceAndTime(entry)}</span>
              )}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
};
