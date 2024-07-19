import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import React, { Fragment } from 'react';
import { getBusRoutes } from '../../constants/stations';
import { getBusRouteSelectionItemHref, useDelimitatedRoute } from '../../utils/router';

export const BusRouteSelection: React.FC = () => {
  const route = useDelimitatedRoute();
  const router = useRouter();
  const busRoutes = getBusRoutes();
  const selected = route.query.busRoute;
  return (
    <div className="bg-mbta-lightBus">
      <Listbox
        value={selected}
        onChange={(key) => router.push(getBusRouteSelectionItemHref(key, route))}
      >
        <div className="relative text-white text-opacity-95">
          <Listbox.Button className="relative w-full cursor-pointer border border-mbta-bus bg-tm-lightGrey py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selected}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon className="h-5 w-5" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
              {busRoutes.map((busRoute, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'
                    }`
                  }
                  value={busRoute}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {busRoute}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-mbta-bus">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </span>
                      ) : null}
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
