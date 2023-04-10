import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { faBicycle, faChevronDown, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../../utils/router';
import { optionsForField } from '../../utils/stations';
import { buttonHighlightFocus, lineColorBackground } from '../../styles/general';
import { selectConfig } from './styles/tailwind';
import { Button } from './Button';

interface StationSelector {
  type: 'from' | 'to';
  fromStation: Station;
  toStation: Station;
  setStation: (station: Station) => void;
}

export const StationSelector: React.FC<StationSelector> = ({
  type,
  fromStation,
  toStation,
  setStation,
}) => {
  const {
    line,
    linePath,
    lineShort,
    query: { busRoute },
  } = useDelimitatedRoute();
  const station = type === 'from' ? fromStation : toStation;

  const stationOptions = optionsForField(type, lineShort, fromStation, toStation, busRoute);

  return (
    <Listbox value={station} onChange={setStation}>
      <div className="relative">
        <Listbox.Button>
          <Button>
            <p
              className={classNames(
                `flex items-center gap-x-1 truncate text-sm font-semibold text-white text-opacity-90`,
                line && buttonHighlightFocus[line]
              )}
            >
              {station.stop_name}
            </p>
            <FontAwesomeIcon icon={faChevronDown} className="h-4 w-4 pl-2 text-white" />
          </Button>
        </Listbox.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Listbox.Options className="max-w-screen absolute right-0 z-10 mt-1 max-h-96 origin-top-right overflow-auto rounded-md bg-white  shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ">
            <div className="py-1">
              {stationOptions?.map((station, stationIndex) => (
                <Listbox.Option
                  key={stationIndex}
                  className={({ active, selected }) =>
                    classNames(
                      'relative cursor-pointer select-none items-center px-4 py-2',
                      active ? selectConfig[linePath] : 'text-gray-900',
                      selected
                        ? `bg-opacity-20 font-semibold ${lineColorBackground[line ?? 'DEFAULT']}`
                        : 'font-normal'
                    )
                  }
                  value={station}
                >
                  <div className="flex items-baseline justify-between gap-x-1 truncate">
                    {station.stop_name}
                    <div className="flex flex-row gap-x-1 pl-4">
                      {station.enclosed_bike_parking ? (
                        <FontAwesomeIcon
                          title="Enclosed Bicycle Parking"
                          icon={faBicycle}
                          className={'m-0 h-3 w-3 rounded-sm bg-gray-800 p-[2px] text-white'}
                        />
                      ) : (
                        <div className="h-4 w-4" />
                      )}
                      {station.accessible ? (
                        <FontAwesomeIcon
                          title="Wheelchair Accessible"
                          icon={faWheelchair}
                          className={'m-0 h-3 w-3 rounded-sm bg-[#167cb9] p-[2px] text-white'}
                        />
                      ) : (
                        <div className="h-2 w-4" />
                      )}
                    </div>
                  </div>
                </Listbox.Option>
              ))}
            </div>
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
