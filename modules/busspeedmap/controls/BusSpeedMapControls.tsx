import React from 'react';
import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { TIME_BANDS } from '../constants';
import type { TimeBand } from '../types';

interface BusSpeedMapControlsProps {
  timeBand: TimeBand;
  setTimeBand: React.Dispatch<React.SetStateAction<TimeBand>>;
  routeFilter: string;
  setRouteFilter: (route: string) => void;
  routeIds: string[];
}

const ALL_ROUTES = '';

export const BusSpeedMapControls: React.FC<BusSpeedMapControlsProps> = ({
  timeBand,
  setTimeBand,
  routeFilter,
  setRouteFilter,
  routeIds,
}) => {
  const bandOptions = TIME_BANDS.map((band) => [band.key, band.label] as [TimeBand, string]);
  const selectedIndex = TIME_BANDS.findIndex((band) => band.key === timeBand);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {/* Six buttons don't fit on a phone, so the same choice is a select there. */}
      <div className="hidden lg:block">
        <ButtonGroup
          options={bandOptions}
          pressFunction={setTimeBand}
          selectedIndex={selectedIndex}
          line="line-bus"
        />
      </div>
      <label className="flex items-center gap-2 text-sm lg:hidden">
        <span className="text-stone-600">Time of day</span>
        <select
          className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
          value={timeBand}
          onChange={(event) => setTimeBand(event.target.value as TimeBand)}
        >
          {TIME_BANDS.map((band) => (
            <option key={band.key} value={band.key}>
              {band.label} ({band.hours})
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="whitespace-nowrap text-stone-600">Route</span>
        <select
          className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm lg:flex-none"
          value={routeFilter}
          onChange={(event) => setRouteFilter(event.target.value)}
        >
          <option value={ALL_ROUTES}>All routes</option>
          {routeIds.map((routeId) => (
            <option key={routeId} value={routeId}>
              {routeId}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
