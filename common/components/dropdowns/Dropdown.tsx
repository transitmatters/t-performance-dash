import React, { Fragment } from 'react';

import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';
import type { SelectOption } from '../../types/inputs';

interface DropdownProps {
  value: SelectOption;
  setValue: (value: SelectOption) => void;
  options: SelectOption[];
}

export const Dropdown: React.FC<DropdownProps> = ({ value, setValue, options }) => {
  return (
    <Listbox value={value} onChange={setValue}>
      {({ open }) => (
        <>
          <div className="relative">
            <Listbox.Button className="relative w-full cursor-default  bg-white py-1.5 pl-3 pr-10 text-left  shadow-sm focus:outline-none focus:ring-1 sm:text-sm">
              <span className="block truncate">{value.label}</span>
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
                {options.map((option) => (
                  <Listbox.Option
                    key={`${option.id}-${option.label}`}
                    className={({ active }) =>
                      classNames(
                        active ? 'bg-design-subtitleGrey text-white' : 'text-gray-900',
                        'relative cursor-default select-none py-2 pl-3 pr-9 hover:bg-design-subtitleGrey'
                      )
                    }
                    value={option}
                  >
                    {({ selected }) => (
                      <span
                        className={classNames(
                          selected ? 'font-semibold' : 'font-normal',
                          'block truncate'
                        )}
                      >
                        {option.label}
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
