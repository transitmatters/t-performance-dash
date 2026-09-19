import React from 'react';
import { ButtonGroup } from '../../../common/components/general/ButtonGroup';
import { DAY_TYPES, DIRECTIONS, PERIODS, TIME_BANDS } from '../constants';
import type { DayType, DirectionFilter, Period, TimeBand } from '../types';

interface BusSpeedMapControlsProps {
  period: Period;
  setPeriod: React.Dispatch<React.SetStateAction<Period>>;
  dayType: DayType;
  setDayType: React.Dispatch<React.SetStateAction<DayType>>;
  timeBand: TimeBand;
  setTimeBand: React.Dispatch<React.SetStateAction<TimeBand>>;
  direction: DirectionFilter;
  setDirection: React.Dispatch<React.SetStateAction<DirectionFilter>>;
}

export const BusSpeedMapControls: React.FC<BusSpeedMapControlsProps> = ({
  period,
  setPeriod,
  dayType,
  setDayType,
  timeBand,
  setTimeBand,
  direction,
  setDirection,
}) => {
  const periodOptions = PERIODS.map((option) => [option.key, option.label] as [Period, string]);
  const selectedPeriodIndex = PERIODS.findIndex((option) => option.key === period);

  const dayTypeOptions = DAY_TYPES.map((option) => [option.key, option.label] as [DayType, string]);
  const selectedDayTypeIndex = DAY_TYPES.findIndex((option) => option.key === dayType);

  const bandOptions = TIME_BANDS.map((band) => [band.key, band.label] as [TimeBand, string]);
  const selectedBandIndex = TIME_BANDS.findIndex((band) => band.key === timeBand);

  const directionOptions = DIRECTIONS.map(
    (option) => [option.key, option.label] as [DirectionFilter, string]
  );
  const selectedDirectionIndex = DIRECTIONS.findIndex((option) => option.key === direction);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
        {/* shrink-0: without it, flexbox would rather squeeze this (and the day-type group
            below) narrower than their own labels need than wrap them onto their own line --
            ButtonGroup's items shrink all the way to 0 internally, which normally keeps a
            group compact but here hides that the group as a whole no longer fits. */}
        <div className="hidden shrink-0 lg:block">
          <ButtonGroup
            options={periodOptions}
            pressFunction={setPeriod}
            selectedIndex={selectedPeriodIndex}
            line="line-bus"
          />
        </div>
        <label className="flex items-center gap-2 text-sm lg:hidden">
          <span className="text-stone-600">Period</span>
          <select
            className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
            value={period}
            onChange={(event) => setPeriod(event.target.value as Period)}
          >
            {PERIODS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {/* Daily features carry no day_type at all -- a single day is already wholly one
            type -- so this only makes sense once a week or month is selected. */}
        {period !== 'daily' && (
          <>
            <div className="hidden shrink-0 lg:block">
              <ButtonGroup
                options={dayTypeOptions}
                pressFunction={setDayType}
                selectedIndex={selectedDayTypeIndex}
                line="line-bus"
                // "Weekdays" and "Weekends & holidays" are too uneven in length to split the
                // row evenly (ButtonGroup's default): the long option would get squeezed
                // narrower than its own text. w-auto sizes the group to its content instead,
                // matching how DAY_FILTER_OPTIONS renders this same pair of labels elsewhere
                // (common/hooks/useChartToggle.tsx) -- paired with shrink-0 above, so a
                // too-narrow row wraps this group onto its own line rather than squeezing it.
                additionalDivClass="w-auto"
                additionalButtonClass="flex-none px-3"
              />
            </div>
            <label className="flex items-center gap-2 text-sm lg:hidden">
              <span className="text-stone-600">Day type</span>
              <select
                className="flex-1 rounded-md border border-stone-300 px-2 py-1.5 text-sm"
                value={dayType}
                onChange={(event) => setDayType(event.target.value as DayType)}
              >
                {DAY_TYPES.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-start lg:justify-between">
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
    </div>
  );
};
