import React, { Fragment } from 'react';
import { Popover, Transition } from '@headlessui/react';

import { LineMetadata, LINE_OBJECTS } from '../../constants/lines';
import SelectedLineIndicator from '../../public/Icons/Components/SelectedLineIndicator.svg';
import { useSelectedStore } from '../../stores/useSelected';

import { classNames } from '../utils/tailwind';
import { buttonConfig, lineSelectionButtonConfig, lineSelectionConfig } from './LineSelectorStyle';

const LineSelectionItem = ({
  lineName,
  selectedLine,
}: {
  lineName: string;
  selectedLine: LineMetadata;
}) => {
  const isSelected = lineName === selectedLine.key;
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

export const LineSelector = () => {
  const selectedLine = useSelectedStore((state) => state.line);
  return (
    <Popover className="relative flex h-full items-center">
      {({ open }) => (
        <>
          <Popover.Overlay className="mb-safe fixed inset-0 bottom-11 bg-black opacity-30" />

          <Popover.Button className="ring-0">
            <div
              className={classNames(
                'ml-2 flex h-8 w-8 rounded-full border-2 bg-opacity-80',
                buttonConfig[selectedLine.key],
                open ? 'shadow-simpleInset' : 'shadow-simple'
              )}
            >
              <p className={`z-10 m-auto select-none text-sm text-white`}>{selectedLine.key}</p>
            </div>
          </Popover.Button>
          <Transition
            // TODO: Slide up.
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-full"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-full"
          >
            <Popover.Panel className="absolute bottom-11 z-10 m-auto table rounded-t-md bg-white px-2">
              <div className="table-row">
                {Object.entries(LINE_OBJECTS).map(([key]) => (
                  <LineSelectionItem key={key} lineName={key} selectedLine={selectedLine} />
                ))}
              </div>
            </Popover.Panel>
          </Transition>
        </>
      )}
    </Popover>
  );
};
