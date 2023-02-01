'use client';
import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import Link from 'next/link';

import { LINE_OBJECTS } from '../../constants/lines';
import { NavBarItem } from '../../constants/NavBarLinks';
import { classNames } from '../utils/tailwind';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../utils/router';
import { NavBarButton } from '../general/NavBarButton';
import {
  buttonConfig,
  lightColors,
  lineSelectionButtonConfig,
  lineSelectionConfig,
} from './LineSelectorStyle';

interface LineSelectorProps {
  value?: NavBarItem;
}

// LineSelector used by the top navbar in desktop mode, and bottom navbar in mobile mode.
export const LineSelector: React.FC<LineSelectorProps> = ({ value }) => {
  const route = useDelimitatedRoute();
  // `value` is only set if this line selector is opened from the nav bar. Which is only in desktop mode.
  const isMobile = value == null;

  // Don't render until we have the line.
  if (!route.line) return null;

  return (
    <Listbox value={LINE_OBJECTS[route.line]} onChange={() => null}>
      {({ open }) => (
        <>
          <Listbox.Button
            className={classNames(
              'w-full cursor-pointer sm:text-sm',
              isMobile ? 'relative ml-2 h-8 w-8 bg-white' : 'bg-tm-grey'
            )}
          >
            {isMobile ? (
              <div
                className={classNames(
                  'relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-opacity-80',
                  buttonConfig[route.line],
                  open ? 'shadow-simpleInset' : 'shadow-simple'
                )}
              >
                <p className={`select-none text-sm text-white`}>{route.line}</p>
              </div>
            ) : (
              <NavBarButton value={value} />
            )}
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options
              className={classNames(
                isMobile
                  ? 'w-34 absolute left-1 -top-3 origin-top-right -translate-y-full transform divide-y divide-gray-100 rounded-md border border-design-lightGrey bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none'
                  : 'fixed top-16 bg-tm-grey'
              )}
            >
              {Object.entries(LINE_OBJECTS).map(([_, metadata], index) => {
                const href = getLineSelectionItemHref(metadata, route);
                return (
                  <Link key={metadata.key} href={href}>
                    <Listbox.Option
                      className={({ active, selected }) =>
                        classNames(
                          active || selected
                            ? 'border-opacity-100 bg-opacity-30'
                            : 'bg-opacity-0 text-gray-900',
                          'relative cursor-pointer select-none py-2 pl-3 pr-6',
                          lightColors[metadata.key],
                          isMobile
                            ? 'border-b border-design-lightGrey'
                            : 'border-t border-gray-600',
                          // Round top of first item to match container.
                          index === 0 && !value ? 'rounded-t-[5px]' : '',
                          // Round bottom of last item to match container.
                          index === Object.keys(LINE_OBJECTS).length - 1 && isMobile
                            ? 'rounded-b-[5px] border-b-0'
                            : ''
                        )
                      }
                      value={metadata}
                    >
                      {({ selected, active }) => (
                        <div
                          className={classNames(
                            selected ? 'font-semibold' : 'font-normal',
                            'flex flex-row gap-2 truncate border-black',
                            isMobile ? 'text-black' : 'text-sm text-white'
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
