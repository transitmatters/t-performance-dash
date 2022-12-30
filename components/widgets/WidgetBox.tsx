import React from 'react';
import Image from 'next/image';
import GoArrow from '../../public/arrow.svg';
import { classNames } from '../utils/tailwind';

type BasicDataWidgetItemProps = {
  title: string;
  data: string;
  analysis: string;
};

type BasicWidgetTitleProps = {
  title: string;
  more: boolean;
};

type SlowZoneGraphWidgetItemProps = {
  title: string;
};

// padding: 8px 0px; pb-8 pt-10
// border: 1px solid #DA291C;
// box-shadow: 2px 2px 0px #DA291C; boxShadow-figma
// border-radius: 10px; rounded-xl

export const BasicDataWidgetItem: React.FC<BasicDataWidgetItemProps> = ({
  title,
  data,
  analysis,
}) => {
  return (
    <div className={classNames('flex flex-col items-center justify-center gap-y-4')}>
      <h2 className={classNames('text-xl')}>{title}</h2>
      <h3 className={classNames('text-2xl text-mbta-red')}>{data}</h3>
      <p className={classNames('text-design-grey text-lg')}>{analysis}</p>
    </div>
  );
};

export const SlowZoneGraphWidgetItem: React.FC<SlowZoneGraphWidgetItemProps> = ({ title }) => {
  return (
    <div className={classNames('flex flex-col items-center justify-center gap-y-2')}>
      <h2 className={classNames('text-xl')}>{title}</h2>
    </div>
  );
};

export const WidgetTitle: React.FC<BasicWidgetTitleProps> = ({ title, more }) => {
  return (
    <div className={classNames('gap flex flex-row items-end justify-between px-2')}>
      <h1 className={classNames('text-2xl font-bold')}>{title}</h1>
      <div className={classNames('text-lg flex flex-row items-center gap-x-2 text-mbta-red')}>
        {more && (
          <>
            <h3>Explore</h3>
            <Image className="h-3 w-auto" src={GoArrow} alt="Go" height={12} width={12} />
          </>
        )}
      </div>
    </div>
  );
};

export const WidgetPage = ({ children }) => {
  return (
    <div className={classNames('flex w-full flex-1 flex-col gap-y-2 p-4')}>
      {children}
      {/* //title
        //data */}
    </div>
  );
};

export const WidgetBox = ({ title, children }) => {
  return (
    <div className={classNames('flex flex-col gap-y-1')}>
      <WidgetTitle title={title} more />
      <div
        className={classNames(
          'box-border flex-1 rounded-lg border border-mbta-red bg-white pb-4 pt-4 shadow-figma'
        )}
      >
        <div className={classNames('flex flex-col items-center gap-y-2 p-2')}>{children}</div>
      </div>
    </div>
  );
};
