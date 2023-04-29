import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import type { SetStateAction } from 'react';
import React, { Fragment } from 'react';
import { lineColorBackground, lineColorRing } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

interface ButtonGroupProps<K, T> {
  options: [K, T][];
  pressFunction: React.Dispatch<SetStateAction<K>>;
  selectedIndex?: number;
  additionalDivClass?: string;
  additionalButtonClass?: string;
}

export const ButtonGroup: <T extends string, K extends string>(
  props: ButtonGroupProps<K, T>
) => React.ReactElement<ButtonGroupProps<K, T>> = ({
  options,
  pressFunction,
  selectedIndex,
  additionalDivClass,
  additionalButtonClass,
}) => {
  const { line } = useDelimitatedRoute();
  return (
    <Tab.Group
      selectedIndex={selectedIndex}
      manual
      onChange={(value) => pressFunction(options[value][0])}
    >
      <Tab.List
        className={classNames(
          'isolate inline-flex w-full rounded-t-md shadow-sm md:rounded-md',
          additionalDivClass
        )}
      >
        {options.map((option, index) => {
          return (
            <Tab as={Fragment} key={option[0]}>
              {({ selected }) => (
                <button
                  type="button"
                  className={classNames(
                    additionalButtonClass,
                    'relative inline-flex w-full items-center justify-center px-3 py-2 text-sm ring-1 ring-inset',
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
