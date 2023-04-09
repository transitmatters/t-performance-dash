import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { faBicycle, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../../utils/router';
import { optionsForField } from '../../utils/stations';
import { buttonHighlightFocus } from '../../styles/general';
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
            <span
              className={classNames(
                `flex items-center gap-x-1 truncate text-xl font-semibold text-white text-opacity-90`,
                line && buttonHighlightFocus[line]
              )}
            >
              {station.stop_name}
            </span>
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
          <Listbox.Options className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {stationOptions?.map((station, stationIndex) => (
                <Listbox.Option
                  key={stationIndex}
                  className={({ active }) =>
                    `relative cursor-default select-none px-4 py-2 ${
                      active ? selectConfig[linePath] : 'text-gray-900'
                    }`
                  }
                  value={station}
                >
                  {({ selected }) => (
                    <>
                      <div
                        className={`flex items-center	gap-x-1 truncate justify-between${
                          selected ? 'font-semibold' : 'font-normal'
                        }`}
                      >
                        {station.stop_name}
                        <div>
                          {station.accessible && (
                            <FontAwesomeIcon
                              icon={faWheelchair}
                              size={'sm'}
                              className={'m-0 h-2.5 w-2.5 rounded-sm bg-blue-500 p-[2px]'}
                            />
                          )}
                          {station.enclosed_bike_parking && (
                            <FontAwesomeIcon
                              icon={faBicycle}
                              size={'sm'}
                              className={'m-0 h-2.5 w-2.5 rounded-sm bg-green-400 p-[2px]'}
                            />
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </div>
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
};
