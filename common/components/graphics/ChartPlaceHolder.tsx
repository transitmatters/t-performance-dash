import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorNotice } from '../notices/ErrorNotice';
import { ChartSkeleton } from './ChartSkeleton';

interface ChartPlaceHolder {
  query?: UseQueryResult<unknown>;
  readyState?: 'waiting' | 'error';
}

export const ChartPlaceHolder = ({ query, readyState }: ChartPlaceHolder) => {
  const isError = query?.isError || readyState === 'error';
  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      {isError ? <ErrorNotice query={query} /> : <ChartSkeleton />}
    </div>
  );
};
