import React, { Fragment } from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

export const Dropdown = ({ setSelectedValue, selectedValue, options }) => {
  return (
    <Listbox value={selectedValue} onChange={setSelectedValue}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default  bg-white py-1.5 pl-3 pr-10 text-left  shadow-sm focus:outline-none focus:ring-1 sm:text-sm">
              <span className="block truncate">{selectedValue.name}</span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon className="text-white-400 h-5 w-5" aria-hidden="true" />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="w-34 absolute -top-3 origin-top-right -translate-y-full transform divide-y divide-gray-100 rounded-md bg-white text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {options.map((person) => (
                  <Listbox.Option
                    key={person.id}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-design-subtitleGrey text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-design-subtitleGrey'
                      )
                    }
                    value={person}
                  >
                    {({ selected, active }) => (
                      <span
                        className={classNames(
                          selected ? 'font-semibold' : 'font-normal',
                          'block truncate'
                        )}
                      >
                        {person.name}
                      </span>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
};
