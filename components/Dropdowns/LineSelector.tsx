import { Popover, Transition } from '@headlessui/react';

import React, { Fragment } from 'react';
import { LINES, LINE_OBJECTS } from '../../constants/lines';
import SelectedLineIndicator from '../../public/Icons/Components/SelectedLineIndicator.svg';

import { classNames } from '../utils/tailwind';
import { lineSelectionButtonConfig, lineSelectionConfig } from './LineSelectorStyle';

const LineSelectionItem = ({ lineName, selectedLine }) => {
  const isSelected = lineName === selectedLine;
  return (
    <div
      className={classNames(
        'my-2 flex flex-row items-center rounded-full pl-2',
        lineSelectionConfig[lineName],
        isSelected
          ? 'border-opacity-100 bg-opacity-20 shadow-selectedLine'
          : 'border-opacity-20 bg-opacity-0 shadow-unselectedLine'
      )}
    >
      <div
        className={classNames(
          'h-5 w-5 rounded-full',
          lineSelectionButtonConfig[lineName],
          lineSelectionConfig[lineName],
          isSelected ? 'bg-opacity-100' : 'bg-opacity-20'
        )}
      ></div>
      <p className="whitespace-nowrap p-2 text-sm">{LINE_OBJECTS[lineName].name}</p>
    </div>
  );
};

export const LineSelector = ({ selectedLine }) => {
  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <Popover.Overlay className="fixed inset-0 bg-black opacity-30" />

          <Popover.Button>
            <div className="ml-2 flex h-8 w-8">
              <p className={`z-10 m-auto select-none text-sm text-white ${open && 'font-bold'}`}>
                RL
              </p>
              <SelectedLineIndicator
                fill={LINE_OBJECTS[selectedLine].color}
                className="absolute h-8 w-8"
                alt="Current Line Indicator"
              />
            </div>
          </Popover.Button>
          <Transition
            // TODO: Slide up.
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-x-0"
            enterTo="opacity-100 scale-x-1"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 scale-x-1"
            leaveTo="opacity-0 scale-x-0"
          >
            <Popover.Panel className="fixed left-2 bottom-12 z-10 m-auto table rounded-lg bg-white px-2 shadow-simple">
              <div className="table-row">
                {LINES.map((lineName) => (
                  <LineSelectionItem
                    key={lineName}
                    lineName={lineName}
                    selectedLine={selectedLine}
                  />
                ))}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
    // <div className="absolute">
    //   <p>Line Selector</p>
    //   {LINES.map((lineName) => {
    //     return <LineSelectionItem key={lineName} lineName={lineName} />;
    //   })}
    // </div>
  );
};
