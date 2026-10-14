import React from 'react';
import { useTranslation } from 'react-i18next';
import { traversalSummary } from '../utils';
import { getBusRouteDisplayName } from '../../../common/constants/lines';
import type { BusSpeedSegmentLeaderboardEntry } from '../types';

interface BusSpeedSegmentLeaderboardProps {
  data: BusSpeedSegmentLeaderboardEntry[];
  onSelectSegment: (entry: BusSpeedSegmentLeaderboardEntry) => void;
}

export const BusSpeedSegmentLeaderboard: React.FC<BusSpeedSegmentLeaderboardProps> = ({
  data,
  onSelectSegment,
}) => {
  const { t } = useTranslation(['busspeedmap', 'common']);
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
                    {t('common:routes.busRoute', { route: getBusRouteDisplayName(entry.route_id) })}
                  </span>
                  <span className="text-stone-600">
                    {' '}
                    ·{' '}
                    {entry.direction_id === 1 ? t('directions.inbound') : t('directions.outbound')}
                  </span>
                </span>
                <span className="text-stone-600">
                  {entry.from_stop_name} → {entry.to_stop_name}
                </span>
                <span className="text-xs text-stone-400">
                  {traversalSummary(entry.n_traversals, entry.n_interpolated)}
                </span>
              </span>
            </span>
            <span className="shrink-0 font-semibold text-stone-900">
              {t('mph', { value: entry.p50_speed_mph.toFixed(1) })}
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
};
