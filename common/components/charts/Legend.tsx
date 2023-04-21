import React from 'react';

export const Legend: React.FC = () => {
  return (
    <div
      className={
        'grid w-full grid-cols-2  items-baseline gap-2 p-1 text-left text-xs sm:flex sm:flex-row sm:gap-4'
      }
    >
      <p>
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#57945B] bg-[#64b96a]"></span>
        {'On time'}
      </p>
      <p>
        <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#D9D31E] bg-[#f5ed00]"></span>
        {'25%+ over Benchmark'}
      </p>
      <p>
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#A1384A] bg-[#c33149]`}
        ></span>{' '}
        {'50%+ over Benchmark'}
      </p>
      <p>
        <span
          className={`mr-1 inline-block h-2.5 w-2.5 rounded-full border border-[#925396] bg-[#bb5cc1]`}
        ></span>{' '}
        {'100%+ over Benchmark'}
      </p>
      <p>
        <span className="mr-1 inline-block h-2.5 w-2.5 items-center border-t-2 border-[#bbb] bg-[#ddd] align-middle"></span>{' '}
        MBTA Benchmark
      </p>
    </div>
  );
};

export const LegendLongTerm: React.FC = () => {
  return (
    <div className="grid w-full grid-cols-2  items-baseline gap-2 p-1 text-left text-xs sm:flex sm:flex-row sm:gap-4">
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
