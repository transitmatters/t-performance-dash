import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import { classNames } from '../utils/tailwind';
import ArrowDownNegative from '../../public/Icons/ArrowDownNegative.svg';

type BasicDataWidgetItemProps = {
  title: string;
  value: string;
  analysis: string;
  explanation: string;
};

export const BasicDataWidgetItem: React.FC<BasicDataWidgetItemProps> = ({
  title,
  value,
  analysis,
  explanation = 'The median is the travel time of the trip which was faster than 50% of the trips today.',
}) => {
  const [tapped, setTapped] = useState(false);
  const [height, setHeight] = useState(0);
  const untappedWidget = useRef(null);

  useEffect(() => {
    if (untappedWidget?.current) setHeight(untappedWidget?.current?.clientHeight || 120);
  }, []);

  if (tapped) {
    return (
      <div
        style={{ height: `${height}px` }}
        className={classNames(
          'w-1/2 overflow-y-scroll rounded-lg border-design-lightGrey bg-white p-2 shadow-tappedDataBox'
        )}
        onClick={() => {
          setTapped(false);
        }}
      >
        <div className={classNames('flex flex-col items-start gap-y-1')}>
          <div className="flex w-full flex-row justify-between">
            <p className={classNames('text-base')}>{title}</p>
            <p className={classNames('text-base font-bold text-black')}>{value}</p>
          </div>
          <p className={classNames('text-sma text-design-subtitleGrey')}>{explanation}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={untappedWidget}
      className={classNames('w-1/2 rounded-lg border-design-lightGrey bg-white p-2 shadow-dataBox')}
      onClick={() => {
        setTapped(true);
      }}
    >
      <div className={classNames('flex flex-col items-start')}>
        <p className={classNames('text-base')}>{title}</p>
        <p className={classNames('text-4xl font-bold text-black')}>{value}</p>
        <div className="flex flex-row items-center gap-x-1">
          <Image className="h-3 w-auto" src={ArrowDownNegative} alt="Your Company" />
          <p className={classNames('text-xs text-design-subtitleGrey')}>{analysis}</p>
        </div>
      </div>
    </div>
  );
};
