import { Popover, Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { Fragment } from 'react';
import { Section, SECTIONS } from '../../constants/sections';

interface SectionSelectionItemProps {
  sectionName: Section;
  selectedSection: Section;
  last: boolean;
}

const SectionSelectionItem: React.FC<SectionSelectionItemProps> = ({
  sectionName,
  selectedSection,
  last,
}) => {
  const isSelected = sectionName === selectedSection;
  return (
    <div className={classNames(!last && 'border-b border-design-lightGrey')}>
      <p className={classNames('mx-2 select-none', isSelected && 'font-bold')}>{sectionName}</p>
    </div>
  );
};

interface SectionSelectorProps {
  selectedSection: Section;
}

export const SectionSelector: React.FC<SectionSelectorProps> = ({ selectedSection }) => {
  return (
    <div className="relative -left-1 flex h-full items-center">
      <Popover>
        {({ open }) => (
          <>
            <Popover.Overlay className="fixed inset-0 bottom-11 bg-black mb-safe opacity-30" />

            <Popover.Button className="h-full">
              <div
                className={classNames(
                  ' flex h-full items-center px-1',
                  open && 'rounded-md bg-white shadow-simpleInset'
                )}
              >
                <p
                  className={classNames(
                    'select-none',
                    open ? 'text-black' : 'text-design-darkGrey'
                  )}
                >
                  {selectedSection}
                </p>
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
              <Popover.Panel className="absolute bottom-11 -left-2 max-h-60 w-24 overflow-auto rounded-t-md bg-white pt-1 text-base focus:outline-none sm:text-sm">
                {SECTIONS.map((sectionName, index) => (
                  <SectionSelectionItem
                    key={sectionName}
                    sectionName={sectionName}
                    selectedSection={selectedSection}
                    last={index === SECTIONS.length - 1}
                  />
                ))}
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </div>
  );
};
