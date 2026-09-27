import React from 'react';
import { getBusRouteDisplayName } from '../../../common/constants/lines';
import { STATION_LINES } from '../constants';
import type { BusStopProperties, StationProperties } from '../types';

const splitList = (value: string): string[] => (value ? value.split(',') : []);

/** "B, C, D, E" for the Green Line's branches, read off the station's route_ids. */
const greenBranches = (routes: string[]): string =>
  routes
    .filter((route) => route.startsWith('Green-'))
    .map((route) => route.slice('Green-'.length))
    .join(', ');

export const StationPopupContent: React.FC<{ station: StationProperties }> = ({ station }) => {
  const routes = splitList(station.routes);
  return (
    <div className="text-xs text-stone-900">
      <p className="font-semibold">{station.stop_name}</p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {splitList(station.lines).map((line) => {
          const branches = line === 'Green' ? greenBranches(routes) : '';
          return (
            <li key={line} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: STATION_LINES[line]?.color ?? '#6b7280' }}
              />
              {STATION_LINES[line]?.label ?? line}
              {branches && <span className="text-stone-600">· {branches}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const BusStopPopupContent: React.FC<{ busStop: BusStopProperties }> = ({ busStop }) => {
  const routes = splitList(busStop.routes).map(getBusRouteDisplayName);
  return (
    <div className="text-xs text-stone-900">
      <p className="font-semibold">{busStop.stop_name}</p>
      {/* The pole's GTFS stop_id is the number printed on the stop's own sign. */}
      <p className="text-stone-600">Stop {busStop.stop_id}</p>
      <p className="mt-1">
        {routes.length === 1 ? 'Route' : 'Routes'} {routes.join(', ')}
      </p>
    </div>
  );
};
