import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import type { SetStateAction } from 'react';
import React, { Fragment } from 'react';
import { lineColorBackground, lineColorRing } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ButtonGroupProps<T> {
  options: [string, T][];
  pressFunction: React.Dispatch<SetStateAction<string>>;
  selected?: number;
}

export const ButtonGroup: <T extends string>(
  props: ButtonGroupProps<T>
) => React.ReactElement<ButtonGroupProps<T>> = ({ options, pressFunction, selected }) => {
  const { line } = useDelimitatedRoute();
  return (
    <Tab.Group onChange={(value) => pressFunction(options[value][0])} selectedIndex={selected}>
      <Tab.List className="isolate inline-flex w-full rounded-md shadow-sm">
        {options.map((option, index) => {
          return (
            <Tab as={Fragment} key={option[0]}>
              {({ selected }) => (
                <button
                  type="button"
                  className={classNames(
                    'w-full justify-center',
                    index === 0 ? 'rounded-l-md' : '-ml-px',
                    index === options.length - 1 && 'rounded-r-md',
                    'relative inline-flex items-center  px-2 py-1 text-sm ring-1 ring-inset focus:z-10',
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
