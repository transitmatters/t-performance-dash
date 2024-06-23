import { Tab } from '@headlessui/react';
import classNames from 'classnames';
import type { SetStateAction } from 'react';
import React, { Fragment } from 'react';
import { lineColorBackground, lineColorBorder, lineColorLightBorder } from '../../styles/general';
import type { Line } from '../../types/lines';

interface ButtonGroupProps<K, T> {
  options: [K, T][];
  pressFunction: React.Dispatch<SetStateAction<K>>;
  selectedIndex?: number;
  additionalDivClass?: string;
  additionalButtonClass?: string;
  isOverview?: boolean;
  line?: Line;
}

export const ButtonGroup: <T extends string, K extends string>(
  props: ButtonGroupProps<K, T>
) => React.ReactElement<ButtonGroupProps<K, T>> = ({
  options,
  pressFunction,
  selectedIndex,
  additionalDivClass,
  additionalButtonClass,
  isOverview,
  line,
}) => {
  return (
    <Tab.Group
      selectedIndex={selectedIndex}
      manual
      onChange={(value) => pressFunction(options[value][0])}
    >
      <Tab.List
        className={classNames(
          'isolate inline-flex w-full overflow-hidden rounded-md border shadow-sm',
          isOverview ? lineColorLightBorder[line ?? 'DEFAULT'] : lineColorBorder[line ?? 'DEFAULT'],
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
                    'relative inline-flex w-full items-center justify-center px-3 py-2 text-sm',
                    index > 0 && '-ml-px border-l',
                    lineColorBorder[line ?? 'DEFAULT'],
                    selected
                      ? `${lineColorBackground[line ?? 'DEFAULT']} text-white hover:bg-opacity-90`
                      : `hover:${
                          lineColorBackground[line ?? 'DEFAULT']
                        } bg-white text-stone-900 hover:bg-opacity-70`
                  )}
                >
                  <p className="leading-none">{option[1]}</p>
                </button>
              )}
            </Tab>
          );
        })}
      </Tab.List>
    </Tab.Group>
  );
};
