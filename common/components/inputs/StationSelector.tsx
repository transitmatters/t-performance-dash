import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { faBicycle, faChevronDown, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../../utils/router';
import { optionsForField, stopIdsForStations, stopNoun } from '../../utils/stations';
import { lineColorVar } from '../../styles/general';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from './Button';

interface StationSelector {
  type: 'from' | 'to';
  fromStation: Station;
  toStation: Station;
  setStation: (station: Station) => void;
}

const branchLabelWidth = {
  'line-red': 'w-8',
  'line-green': 'w-12',
  DEFAULT: 'w-0',
};

export const StationSelector = ({ type, fromStation, toStation, setStation }: StationSelector) => {
  const {
    line,
    lineShort,
    query: { busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  const [open, setOpen] = useState(false);
  const station = type === 'from' ? fromStation : toStation;
  const noun = stopNoun(lineShort);
  const stationOptions = optionsForField(
    type,
    lineShort,
    fromStation,
    busRoute,
    crRoute,
    ferryRoute
  );

  /** A stop is unselectable when it's the other end of the trip, or nothing connects the two. */
  const isDisabled = (option: Station) =>
    type === 'from'
      ? option.station === toStation.station ||
        stopIdsForStations(option, toStation).fromStopIds?.length === 0
      : option.station === fromStation.station ||
        stopIdsForStations(fromStation, option).toStopIds?.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          additionalClasses="justify-between grow min-w-0 overflow-hidden h-10 md:h-8 md:w-auto md:max-w-64 md:grow-0"
          aria-label={`${type === 'from' ? 'Start' : 'End'} ${noun}: ${station.stop_name}. Change it.`}
        >
          <p className="items-center gap-x-1 truncate text-sm">{station.stop_name}</p>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="size-3 shrink-0 pl-2 text-stone-500 dark:text-stone-400"
            aria-hidden
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" style={lineColorVar(line)} className="w-[min(22rem,90vw)] p-0">
        <Command>
          <CommandInput placeholder={`Search ${noun}s...`} />
          <CommandList>
            <CommandEmpty>No matching {noun}.</CommandEmpty>
            {stationOptions?.map((option) => {
              const disabled = isDisabled(option);
              return (
                <CommandItem
                  // Some routes repeat a stop name, so the station id keeps each option distinct.
                  key={option.station}
                  value={option.station}
                  keywords={[option.stop_name]}
                  disabled={disabled}
                  onSelect={() => {
                    setStation(option);
                    setOpen(false);
                  }}
                  className={classNames(
                    'gap-x-1',
                    option.station === station.station && 'bg-(--line-color)/20 font-semibold'
                  )}
                >
                  <div className="flex w-full items-center justify-between gap-x-1 truncate">
                    <div className="flex flex-row items-baseline justify-start">
                      <div
                        className={classNames(
                          'text-muted-foreground flex flex-row gap-px text-xs',
                          branchLabelWidth[line ?? 'DEFAULT'] ?? ''
                        )}
                      >
                        {option.branches?.map((branch) => (
                          <p key={branch}>{branch}</p>
                        ))}
                      </div>
                      <span className="truncate">{option.stop_name}</span>
                    </div>
                    <div className="flex shrink-0 flex-row gap-x-1 pl-4">
                      {option.enclosed_bike_parking ? (
                        <FontAwesomeIcon
                          title="Enclosed Bicycle Parking"
                          icon={faBicycle}
                          className="m-0 h-3 w-3 rounded-xs bg-gray-800 p-[2px] text-white"
                        />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      {option.accessible ? (
                        <FontAwesomeIcon
                          title="Wheelchair Accessible"
                          icon={faWheelchair}
                          className="m-0 h-3 w-3 rounded-xs bg-[#167cb9] p-[2px] text-white"
                        />
                      ) : (
                        <div className="h-2 w-4" />
                      )}
                    </div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
