import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import React, { Fragment } from 'react';
import { getCommuterRailRoutes } from '../../constants/stations';
import { getCommuterRailRouteSelectionItemHref, useDelimitatedRoute } from '../../utils/router';
import { COMMUTER_RAIL_LINE_NAMES } from '../../types/lines';

export const CommuterRailRouteSelection: React.FC = () => {
  const route = useDelimitatedRoute();
  const router = useRouter();
  const crRoutes = getCommuterRailRoutes();
  const selected = route.query.crRoute;

  return (
    <div className="bg-mbta-lightCommuterRail">
      <Listbox
        value={selected}
        onChange={(key) => router.push(getCommuterRailRouteSelectionItemHref(key, route))}
      >
        <div className="text-opacity-95 relative text-white">
          <Listbox.Button className="border-mbta-commuterRail bg-tm-lightGrey relative w-full cursor-pointer border py-2 pr-10 pl-3 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selected && COMMUTER_RAIL_LINE_NAMES[selected]}</span>
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
              {crRoutes.map((crRoute, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-pointer py-2 pr-4 pl-10 select-none ${
                      active ? 'bg-fuchsia-100 text-fuchsia-900' : 'text-gray-900'
                    }`
                  }
                  value={crRoute}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {COMMUTER_RAIL_LINE_NAMES[crRoute]}
                      </span>
                      {selected ? (
                        <span className="text-mbta-commuterRail absolute inset-y-0 left-0 flex items-center pl-3">
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
