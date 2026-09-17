import React from 'react';
import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { DIRECTIONS, TIME_BANDS } from '../constants';
import type { DirectionFilter, TimeBand } from '../types';

interface BusSpeedMapControlsProps {
  timeBand: TimeBand;
  setTimeBand: React.Dispatch<React.SetStateAction<TimeBand>>;
  direction: DirectionFilter;
  setDirection: React.Dispatch<React.SetStateAction<DirectionFilter>>;
}

export const BusSpeedMapControls: React.FC<BusSpeedMapControlsProps> = ({
  timeBand,
  setTimeBand,
  direction,
  setDirection,
}) => {
  const bandOptions = TIME_BANDS.map((band) => [band.key, band.label] as [TimeBand, string]);
  const selectedBandIndex = TIME_BANDS.findIndex((band) => band.key === timeBand);

  const directionOptions = DIRECTIONS.map(
    (option) => [option.key, option.label] as [DirectionFilter, string]
  );
  const selectedDirectionIndex = DIRECTIONS.findIndex((option) => option.key === direction);

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      {/* Six buttons don't fit on a phone, so the same choice is a select there. */}
      <div className="hidden lg:block">
        <ButtonGroup
          options={bandOptions}
          pressFunction={setTimeBand}
          selectedIndex={selectedBandIndex}
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

      <div className="hidden lg:block">
        <ButtonGroup
          options={directionOptions}
          pressFunction={setDirection}
          selectedIndex={selectedDirectionIndex}
          line="line-bus"
        />
      </div>
      <label className="flex items-center gap-2 text-sm lg:hidden">
        <span className="text-stone-600">Direction</span>
        <select
          className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
          value={direction}
          onChange={(event) => setDirection(event.target.value as DirectionFilter)}
        >
          {DIRECTIONS.map((option) => (
            <option key={option.key} value={option.key}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
};
