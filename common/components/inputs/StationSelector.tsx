import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { faBicycle, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import { capitalize } from 'lodash';
import classNames from 'classnames';
import type { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../../utils/router';
import { optionsForField } from '../../utils/stations';
import { selectConfig } from './styles/tailwind';
import { buttonHighlightConfig } from './styles/inputStyle';

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
  const { line, linePath, lineShort } = useDelimitatedRoute();

  const station = type === 'from' ? fromStation : toStation;

  const stationOptions = optionsForField(type, lineShort, fromStation, toStation);

  return (
    <div className="z-10 w-full">
      <Listbox value={station} onChange={setStation}>
        <div className="relative">
          <Listbox.Button
            className={classNames(
              'inline-flex h-8 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2  focus:ring-offset-2',
              line && buttonHighlightConfig[line]
            )}
          >
            <span className={`flex items-center gap-x-1 truncate font-normal`}>
              <span className={`font-medium`}>{capitalize(type)}: </span>
              {station.stop_name}
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
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
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
                          selected ? 'font-semibold' : 'font-normal'
                        }`}
                      >
                        {station.stop_name}
                        {station.accessible && (
                          <FontAwesomeIcon
                            icon={faWheelchair}
                            size={'sm'}
                            className={'m-0 h-2.5 w-2.5 rounded-sm bg-blue-500 p-[2px] text-white'}
                          />
                        )}
                        {station.enclosed_bike_parking && (
                          <FontAwesomeIcon icon={faBicycle} size={'sm'} />
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
