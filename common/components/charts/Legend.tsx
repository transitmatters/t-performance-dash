import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Disclosure } from '@headlessui/react';
import React from 'react';

interface LegendProps {
  showUnderRatio?: boolean;
}

export const LegendSingleDay: React.FC<LegendProps> = ({ showUnderRatio = false }) => {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="flex w-full flex-col rounded-md border border-stone-100 text-stone-700 shadow-sm">
          <Disclosure.Button className="">
            <div className="flex flex-row items-center justify-between px-4 py-1">
              <p className="text-xs italic">Legend</p>
              <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="" />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={
              'grid w-full grid-cols-2 items-baseline p-1 px-4 text-left text-xs lg:flex lg:flex-row lg:gap-4'
            }
          >
            <LegendSingle showUnderRatio={showUnderRatio} />
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};

const LegendSingle: React.FC<LegendProps> = ({ showUnderRatio = false }) => {
  return (
    <>
      <div className="col-span-2 flex flex-row items-baseline gap-2 pb-1 italic lg:pb-0">
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
        {'25%+ off'}
      </p>
      <p>
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#A1384A] bg-[#c33149]`}
        ></span>{' '}
        {'50%+ off'}
      </p>
      <p>
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#925396] bg-[#bb5cc1]`}
        ></span>{' '}
        {'100%+ off'}
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

export const LegendSpeedMap: React.FC = () => {
  return (
    <Disclosure>
      {({ open }) => (
        <div className="flex w-full flex-col rounded-md border border-stone-100 text-stone-700 shadow-sm">
          <Disclosure.Button className="">
            <div className="flex flex-row items-center justify-between px-4 py-1">
              <div className="flex w-full flex-row items-baseline gap-2 p-1 text-left text-xs sm:gap-4">
                <p>
                  <span className="mr-1 inline-block h-2.5 w-5 rounded-full border border-[#57945B]/35 bg-[#64b96a]/50"></span>
                  {'Over 30 MPH'}
                </p>
                <p>
                  <span className="mr-1 inline-block h-2.5 w-5 rounded-full border border-[#D9D31E]/35 bg-[#f5ed00]/50"></span>
                  {'20-30 mph'}
                </p>
                <p>
                  <span
                    className={`mr-1 inline-block h-2.5 w-5 rounded-full border border-[#A1384A]/35 bg-[#c33149]/50`}
                  ></span>{' '}
                  {'Under 20mph'}
                </p>
              </div>
              <FontAwesomeIcon icon={open ? faChevronUp : faChevronDown} className="" />
            </div>
          </Disclosure.Button>
          <Disclosure.Panel
            className={
              'grid w-full grid-cols-2 items-baseline p-1 px-4 text-left text-xs lg:flex lg:flex-row lg:gap-4'
            }
          >
            Speed is calculated using the daily median of the travel times between the two stops,
            divided by the distance between the two stops. These station distances are calculated
            using official distances from a MBTA dataset. These distances may be different than the
            distances between signals, and exclude dwells, leading to some higher or lower MPH
            numbers than reality. These numbers are our best approximation of the speeds of trains
            on the line.
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  );
};
