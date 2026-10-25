import classNames from 'classnames';
import type { FC, ReactNode } from 'react';

interface DataPairProps {
  children: ReactNode;
  last?: boolean;
}

export const DataPair: FC<DataPairProps> = ({ children, last }) => {
  return (
    <div
      className={classNames(
        last ? 'border-0' : 'border-r',
        'flex h-full min-w-38 flex-col gap-2 px-2 md:min-w-48'
      )}
    >
      {children}
    </div>
  );
};
