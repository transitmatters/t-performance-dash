import React, { ReactNode } from 'react';
import { classNames } from '../utils/tailwind';

type DataPageHeaderProps = {
  title: string;
  children: ReactNode;
};

export const DataPageHeader: React.FC<DataPageHeaderProps> = ({ title, children }) => {
  return (
    <div className={classNames('sticky top-0 mx-1 mb-px w-full justify-center bg-white')}>
      <div className="mx-3 mt-2 bg-white">
        <div
          className={classNames(
            'flex flex-col items-center justify-center gap-y-1 rounded-lg bg-mbta-red py-1 shadow-dataBox'
          )}
        >
          <h1 className={classNames('text-center text-3xl font-bold text-white')}>{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
};
