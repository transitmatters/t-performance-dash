'use client';
import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import Link from 'next/link';

import { LINE_OBJECTS } from '../../constants/lines';
import { NavBarItem } from '../../constants/NavBarLinks';
import { classNames } from '../utils/tailwind';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../utils/router';
import { NavBarButton } from '../general/NavBarButton';
import { lightColors, lineSelectionButtonConfig, lineSelectionConfig } from './LineSelectorStyle';

interface LineSelectorNavBarProps {
  value: NavBarItem;
}

export const LineSelectorNavBar: React.FC<LineSelectorNavBarProps> = ({ value }) => {
  const route = useDelimitatedRoute();
  const buttonDiv = 'w-full cursor-pointer sm:text-sm bg-tm-grey';

  // Don't render fully until we have the line.
  if (!route.line) {
    return <NavBarButton value={value} />;
  }

  return (
    <Listbox value={LINE_OBJECTS[route.line]} onChange={() => null}>
      {({ open }) => (
        <>
          <Listbox.Button className={buttonDiv}>
            <NavBarButton value={value} />
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="fixed top-16 bg-tm-grey">
              {Object.entries(LINE_OBJECTS).map(([, metadata]) => {
                const href = getLineSelectionItemHref(metadata, route);
                return (
                  <Link key={metadata.key} href={href}>
                    <Listbox.Option
                      className={({ active, selected }) =>
                        classNames(
                          active || selected
                            ? 'border-opacity-100 bg-opacity-30'
                            : 'bg-opacity-0 text-gray-900',
                          'relative cursor-pointer select-none border-t border-gray-600 py-2 pl-3 pr-6',
                          lightColors[metadata.key]
                        )
                      }
                      value={metadata}
                    >
                      {({ selected, active }) => (
                        <div
                          className={classNames(
                            selected ? 'font-semibold' : 'font-normal',
                            'flex flex-row gap-2 truncate border-black text-sm text-white'
                          )}
                        >
                          <div
                            className={classNames(
                              'h-5 w-5 rounded-full border',
                              lineSelectionButtonConfig[metadata.key],
                              selected || active
                                ? lineSelectionConfig[metadata.key]
                                : lightColors[metadata.key]
                            )}
                          ></div>
                          {metadata.name}
                        </div>
                      )}
                    </Listbox.Option>
                  </Link>
                );
              })}
            </Listbox.Options>
          </Transition>
        </>
      )}
    </Listbox>
  );
};
