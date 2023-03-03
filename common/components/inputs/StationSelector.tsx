import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { faBicycle, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import type { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../../utils/router';
import { optionsForField } from '../../utils/stations';
import { selectConfig } from './styles/tailwind';

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
  const { linePath, lineShort } = useDelimitatedRoute();

  const station = type === 'from' ? fromStation : toStation;

  const stationOptions = optionsForField(type, lineShort, toStation, fromStation);

  return (
    <div className="">
      <Listbox value={station} onChange={setStation}>
        <div className="relative mt-1">
          <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{station.stop_name}</span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {stationOptions?.map((station, stationIndex) => (
                <Listbox.Option
                  key={stationIndex}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? selectConfig[linePath] : 'text-gray-900'
                    }`
                  }
                  value={station}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`flex items-center	gap-x-1 truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {station.stop_name}
                        {station.accessible && (
                          <FontAwesomeIcon
                            icon={faWheelchair}
                            size={'sm'}
                            className={'m-0 h-2.5 w-2.5 rounded-sm bg-blue-500 p-[2px]'}
                          />
                        )}
                        {station.pedal_park && (
                          <FontAwesomeIcon
                            icon={faBicycle}
                            size={'sm'}
                            className={'m-0 h-2.5 w-2.5 rounded-sm bg-green-400 p-[2px]'}
                          />
                        )}
                      </span>
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};
