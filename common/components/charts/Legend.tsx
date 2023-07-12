import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure } from '@headlessui/react';
import React from 'react';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const LegendSingleDay: React.FC = () => {
  const isMobile = !useBreakpoint('md');
  if (isMobile) return <LegendMobile />;
  return <LegendDesktop />;
};

const LegendMobile: React.FC = () => {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="flex w-full flex-col rounded-md border border-stone-100 shadow-sm">
          <Disclosure.Button className="">
            <div className="flex flex-row items-center justify-between px-4 py-1">
              <p className="text-xs italic text-stone-700">Legend</p>
              <FontAwesomeIcon
                icon={open ? faChevronUp : faChevronDown}
                className="text-stone-700"
              />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={
              'grid w-full grid-cols-2 items-baseline p-1 text-left text-xs lg:flex lg:flex-row lg:gap-4'
            }
          >
            <LegendSingle />
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

const LegendDesktop: React.FC = () => {
  return (
    <div
      className={
        'grid w-full grid-cols-2 items-baseline p-1 text-left text-xs lg:flex lg:flex-row lg:gap-4'
      }
    >
      <LegendSingle />
    </div>
  );
};

const LegendSingle: React.FC = () => {
  return (
    <>
      <div className="col-span-2 flex flex-row items-baseline gap-2 pb-1 lg:pb-0">
        <p>
          Compare to{' '}
          <span className="top-[1px] inline-block h-2.5 w-2.5 items-center border-t-2 border-[#bbb] bg-[#ddd] shadow-sm"></span>{' '}
          MBTA benchmark:
        </p>
      </div>
      <p>
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#57945B] bg-[#64b96a]"></span>
        {'On time'}
      </p>
      <p>
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#D9D31E] bg-[#f5ed00]"></span>
        {'25%+ above'}
      </p>
      <p>
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#A1384A] bg-[#c33149]`}
        ></span>{' '}
        {'50%+ above'}
      </p>
      <p>
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#925396] bg-[#bb5cc1]`}
        ></span>{' '}
        {'100%+ above'}
      </p>
    </>
  );
};

export const LegendLongTerm: React.FC = () => {
  return (
    <div className="flex w-full flex-row items-baseline gap-2 p-1 text-left text-xs sm:gap-4">
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-full bg-[#000]'}></span> Median
      </p>
      <p>
        <span className={'mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-[#C8CCD2]'}></span>{' '}
        Interquartile range
      </p>
    </div>
  );
};
