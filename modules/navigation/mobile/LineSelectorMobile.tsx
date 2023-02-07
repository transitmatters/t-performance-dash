import { Listbox, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';
import Link from 'next/link';

import classNames from 'classnames';
import { LINE_OBJECTS } from '../../../common/constants/lines';
import { getLineSelectionItemHref, useDelimitatedRoute } from '../../../common/utils/router';
import {
  buttonConfig,
  lightColors,
  lineSelectionButtonConfig,
  lineSelectionConfig,
} from '../styles/lineSelector';

export const LineSelectorMobile = () => {
  const route = useDelimitatedRoute();

  const buttonDiv = 'w-full relative ml-2 h-8 w-8 bg-white';

  // Don't render until we have the line.
  if (!route.line || !route) {
    return <div className={buttonDiv}></div>;
  }

  return (
    <Listbox value={LINE_OBJECTS[route.line]} onChange={() => null}>
      {({ open }) => (
        <>
          <Listbox.Button className={buttonDiv}>
            <div
              className={classNames(
                'relative flex h-8 w-8 items-center justify-center rounded-full border-2 bg-opacity-80',
                route.line && buttonConfig[route.line],
                open ? 'shadow-simpleInset' : 'shadow-simple'
              )}
            >
              <p className={`select-none text-sm text-white`}>{route.line}</p>
            </div>
          </Listbox.Button>

          <Transition
            show={open}
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="w-34 absolute left-1 -top-3 origin-top-right -translate-y-full transform divide-y divide-gray-100 rounded-md border border-design-lightGrey bg-white text-xs shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              {Object.entries(LINE_OBJECTS).map(([, metadata], index) => {
                const href = getLineSelectionItemHref(metadata, route);
                return (
                  <Link key={metadata.key} href={href}>
                    <Listbox.Option
                      className={({ active, selected }) =>
                        classNames(
                          active || selected
                            ? 'border-opacity-100 bg-opacity-30'
                            : 'bg-opacity-0 text-gray-900',
                          'relative cursor-pointer select-none border-b border-design-lightGrey py-2 pl-3 pr-6',
                          lightColors[metadata.key],
                          // Round top of first item to match container.
                          index === 0 ? 'rounded-t-[5px]' : '',
                          // Round bottom of last item to match container.
                          index === Object.keys(LINE_OBJECTS).length - 1
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
                            'flex flex-row gap-2 truncate border-black text-black'
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
                          />
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
