import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import { faBicycle, faWheelchair } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { mbtaTextConfig } from './styles/tailwind';
import type { Station } from '../../types/stations';
import { useDelimitatedRoute } from '../../utils/router';
import { optionsForField } from '../../utils/stations';
import { selectConfig } from './styles/tailwind';
import { buttonHighlightConfig } from './styles/inputStyle';
import { lineColorBackground } from '../../styles/general';
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
  const { line, linePath, lineShort } = useDelimitatedRoute();

  const station = type === 'from' ? fromStation : toStation;

  const stationOptions = optionsForField(type, lineShort, fromStation, toStation);

  return (
    <Listbox value={station} onChange={setStation}>
      <div className="relative">
        <Listbox.Button>
          <Button>
            <span
              className={`flex items-center gap-x-1 truncate text-xl font-semibold text-white text-opacity-90`}
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
                    `relative cursor-default select-none py-2 px-4 ${
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
                      </span>
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
