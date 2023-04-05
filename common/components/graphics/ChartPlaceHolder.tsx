import type { UseQueryResult } from '@tanstack/react-query';
import React from 'react';
import { ErrorNotice } from '../notices/ErrorNotice';
import { LoadingSpinner } from './LoadingSpinner';

interface ChartPlaceHolder {
  query: UseQueryResult<unknown>;
}

export const ChartPlaceHolder: React.FC<ChartPlaceHolder> = ({ query }) => {
  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      {query.isError ? <ErrorNotice /> : <LoadingSpinner />}
    </div>
  );
};
