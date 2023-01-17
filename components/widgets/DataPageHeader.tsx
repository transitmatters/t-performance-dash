import React, { ReactNode } from 'react';
import { classNames } from '../utils/tailwind';

type DataPageHeaderProps = {
  title: string;
  dateString: string;
  line: string;
  children?: ReactNode;
};

export const DataPageHeader: React.FC<DataPageHeaderProps> = ({
  title,
  dateString,
  line,
  children,
}) => {
  return (
    <div className={classNames('sticky top-11 mx-1 mb-px w-full justify-center sm:top-16')}>
      <div className="mx-3">
        <div
          className={classNames(
            'flex flex-col items-center justify-center gap-y-1 rounded-b-lg bg-white py-1 shadow-dataBox'
          )}
        >
          <div>
            <h1
              style={{ marginBottom: '-6px' }}
              className={classNames('text-center text-3xl font-bold text-mbta-red')}
            >
              {title}
            </h1>
            <h2
              className={classNames('text-base italic text-design-subtitleGrey')}
            >{`${line} - ${dateString}`}</h2>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};
