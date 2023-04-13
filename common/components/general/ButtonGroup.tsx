import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import type { SetStateAction } from 'react';
import React, { Fragment } from 'react';
import { lineColorBackground, lineColorRing } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ButtonGroupProps<K, T> {
  options: [K, T][];
  pressFunction: React.Dispatch<SetStateAction<K>>;
<<<<<<< HEAD
=======
  selectedIndex?: number;
>>>>>>> origin/dashboard-v4
}

export const ButtonGroup: <T extends string, K extends string>(
  props: ButtonGroupProps<K, T>
<<<<<<< HEAD
) => React.ReactElement<ButtonGroupProps<K, T>> = ({ options, pressFunction }) => {
  const { line } = useDelimitatedRoute();
  return (
    <Tab.Group manual onChange={(value) => pressFunction(options[value][0])}>
=======
) => React.ReactElement<ButtonGroupProps<K, T>> = ({ options, pressFunction, selectedIndex }) => {
  const { line } = useDelimitatedRoute();
  return (
    <Tab.Group
      selectedIndex={selectedIndex}
      manual
      onChange={(value) => pressFunction(options[value][0])}
    >
>>>>>>> origin/dashboard-v4
      <Tab.List className="isolate inline-flex w-full rounded-t-md shadow-sm md:w-fit md:rounded-md">
        {options.map((option, index) => {
          return (
            <Tab as={Fragment} key={option[0]}>
              {({ selected }) => (
                <button
                  type="button"
                  className={classNames(
                    'relative inline-flex w-full items-center justify-center px-3 py-2 text-sm ring-1 ring-inset focus:z-10 md:w-auto ',
                    index === 0 ? 'rounded-tl-md md:rounded-l-md' : '-ml-px',
                    index === options.length - 1 && 'rounded-tr-md md:rounded-r-md',
                    lineColorRing[line ?? 'DEFAULT'],
                    selected
                      ? `${lineColorBackground[line ?? 'DEFAULT']} text-white hover:bg-opacity-90`
                      : `hover:${
                          lineColorBackground[line ?? 'DEFAULT']
                        } bg-white text-stone-900 hover:bg-opacity-70 hover:text-white`
                  )}
                >
                  {option[1]}
                </button>
              )}
            </Tab>
          );
        })}
      </Tab.List>
    </Tab.Group>
  );
};
