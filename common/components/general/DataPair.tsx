import classNames from 'classnames';
import React from 'react';

interface DataPairProps {
  children: React.ReactNode;
  last?: boolean;
}

export const DataPair: React.FC<DataPairProps> = ({ children, last }) => {
  return (
    <div
      className={classNames(
        last ? 'border-0' : 'border-r',
        'flex h-full min-w-[9.5rem] flex-col gap-2 px-2 md:min-w-[12rem]'
      )}
    >
      {children}
    </div>
  );
};
