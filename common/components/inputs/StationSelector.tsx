import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { faBicycle, faChevronDown, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../../utils/router';
import { optionsForField, stopIdsForStations } from '../../utils/stations';
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

export const StationSelector: React.FC<StationSelector> = ({
  type,
  fromStation,
  toStation,
  setStation,
}) => {
  const {
    line,
    lineShort,
    query: { busRoute, crRoute, ferryRoute },
  } = useDelimitatedRoute();
  const [open, setOpen] = React.useState(false);
  const station = type === 'from' ? fromStation : toStation;
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
        <div className="w-fit grow overflow-hidden">
          <Button additionalClasses="justify-between w-full h-10 md:h-7">
            <p className="items-center gap-x-1 truncate text-sm font-semibold">
              {station.stop_name}
            </p>
            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 pl-2" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" style={lineColorVar(line)} className="w-[min(22rem,90vw)] p-0">
        <Command>
          <CommandInput placeholder="Search stations..." />
          <CommandList>
            <CommandEmpty>No matching station.</CommandEmpty>
            {stationOptions?.map((option) => {
              const disabled = isDisabled(option);
              return (
                <CommandItem
                  key={option.stop_name}
                  value={option.stop_name}
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
                          'flex flex-row gap-px text-xs text-stone-500',
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
