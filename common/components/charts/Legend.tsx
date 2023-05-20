import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div
      className={
        'grid w-full grid-cols-2 items-baseline p-1 text-left text-xs lg:flex lg:flex-row lg:gap-4'
      }
    >
      <div className="col-span-2 flex flex-row items-baseline gap-2 pb-1 lg:pb-0">
        <p>
          Compare to{' '}
          <span className="top-[1px] inline-block h-2.5 w-2.5 items-center border-t-2 border-[#bbb] bg-[#ddd] shadow-sm"></span>{' '}
          MBTA benchmark:
        </p>
      </div>
      <p>
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#57945B] bg-[#64b96a]"></span>
        {'Below 125%'}
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
    </div>
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
