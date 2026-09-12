import React from 'react';
import { SPEED_COLOR_STOPS } from '../constants';

/**
 * The caption is load-bearing. `p50_speed_mph` is measured arrival-to-arrival, so it
 * includes the time the bus spends sitting at the first stop of the segment — which on the
 * MBTA is roughly as long as the driving itself. Anyone reading these numbers as "how fast
 * the bus drives" will conclude the map is broken and reach for the moving-speed column,
 * which reads more than twice as high and describes nobody's actual trip.
 */
export const BusSpeedLegend: React.FC = () => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-600">Slower</span>
        <div className="flex overflow-hidden rounded-sm border border-stone-300">
          {SPEED_COLOR_STOPS.map(([speed, color]) => (
            <div key={speed} className="flex w-12 flex-col items-center">
              <div className="h-3 w-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] leading-tight text-stone-600">{speed}</span>
            </div>
          ))}
        </div>
        <span className="text-xs text-stone-600">Faster</span>
      </div>
      <p className="text-xs italic text-stone-600">
        Median speed from stop to stop, including time spent waiting at the stop — what a rider on
        board experiences.
      </p>
    </div>
  );
};
