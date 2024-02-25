import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import { ErrorNotice } from '../notices/ErrorNotice';
import { LoadingSpinner } from './LoadingSpinner';

interface ChartPlaceHolder {
  query?: UseQueryResult<unknown>;
  readyState?: 'waiting' | 'error';
  isInverse?: boolean;
}

export const ChartPlaceHolder: React.FC<ChartPlaceHolder> = ({
  query,
  readyState,
  isInverse: inverse = false,
}) => {
  const isError = query?.isError || readyState === 'error';
  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      {isError ? <ErrorNotice query={query} inverse={inverse} /> : <LoadingSpinner />}
    </div>
  );
};
