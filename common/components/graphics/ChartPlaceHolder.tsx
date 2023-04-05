import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import classNames from 'classnames';
import { ErrorNotice } from '../notices/ErrorNotice';
import { LoadingSpinner } from './LoadingSpinner';

interface ChartPlaceHolder {
  query: UseQueryResult<unknown>;
  inverse: boolean;
}

export const ChartPlaceHolder: React.FC<ChartPlaceHolder> = ({ query, inverse }) => {
  return (
    <div
      className={classNames(
        'relative flex h-60 w-full items-center justify-center',
        !inverse && 'bg-white bg-opacity-90'
      )}
    >
      {query.isError ? <ErrorNotice inverse={inverse} /> : <LoadingSpinner />}
    </div>
  );
};
