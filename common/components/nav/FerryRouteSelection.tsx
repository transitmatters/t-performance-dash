import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { useRouter } from 'next/navigation';
import React, { Fragment } from 'react';
import { getFerryRoutes } from '../../constants/stations';
import { getFerryRouteSelectionItemHref, useDelimitatedRoute } from '../../utils/router';
import { FERRY_LINE_NAMES } from '../../types/lines';

export const FerryRouteSelection: React.FC = () => {
  const route = useDelimitatedRoute();
  const router = useRouter();
  const ferryRoutes = getFerryRoutes();
  const selected = route.query.ferryRoute;

  return (
    <div className="bg-mbta-lightFerry">
      <Listbox
        value={selected}
        onChange={(key) => router.push(getFerryRouteSelectionItemHref(key, route))}
      >
        <div className="relative text-white text-opacity-95">
          <Listbox.Button className="border-mbta-ferry relative w-full cursor-pointer border bg-tm-lightGrey py-2 pl-3 pr-10 text-left focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selected && FERRY_LINE_NAMES[selected]}</span>
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
              {ferryRoutes.map((ferryRoute, personIdx) => (
                <Listbox.Option
                  key={personIdx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-fuchsia-100 text-fuchsia-900' : 'text-gray-900'
                    }`
                  }
                  value={ferryRoute}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {FERRY_LINE_NAMES[ferryRoute]}
                      </span>
                      {selected ? (
                        <span className="text-mbta-ferry absolute inset-y-0 left-0 flex items-center pl-3">
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
