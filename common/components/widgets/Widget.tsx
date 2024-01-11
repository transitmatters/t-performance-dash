import React, { useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';

import { ChartPlaceHolder } from '../graphics/ChartPlaceHolder';
import { WidgetDiv } from './WidgetDiv';
import { WidgetTitle } from './WidgetTitle';

type ReadyDependency = unknown | UseQueryResult;
type ReadyState = 'ready' | 'waiting' | 'error';

interface Props {
  ready?: ReadyDependency | ReadyDependency[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}

const isUseQueryResult = (obj: unknown): obj is UseQueryResult => {
  return !!obj && typeof obj === 'object' && 'isLoading' in obj && 'isError' in obj;
};

const getReadyState = (ready: ReadyDependency | ReadyDependency[]) => {
  const readyArray = Array.isArray(ready) ? ready : [ready];
  const eachState: ReadyState[] = readyArray.map((entry) =>
    isUseQueryResult(entry)
      ? entry.isError
        ? 'error'
        : entry.data
          ? 'ready'
          : 'waiting'
      : entry
        ? 'ready'
        : 'waiting'
  );
  if (eachState.some((state) => state === 'error')) {
    return 'error';
  }
  if (eachState.some((state) => state === 'waiting')) {
    return 'waiting';
  }
  return 'ready';
};

export const Widget: React.FC<Props> = (props) => {
  const { title, subtitle, children, ready: readyDependencies } = props;
  const [hasError, setHasError] = useState<boolean>();

  const readyState = hasError
    ? 'error'
    : readyDependencies
      ? getReadyState(readyDependencies)
      : 'ready';

  return (
    <WidgetDiv>
      <WidgetTitle title={title} subtitle={subtitle} />
      {readyState === 'ready' ? (
        <ErrorBoundary onError={() => setHasError(true)} fallbackRender={() => null}>
          {children}
        </ErrorBoundary>
      ) : (
        <div className="relative flex h-full">
          <ChartPlaceHolder readyState={readyState} />
        </div>
      )}
    </WidgetDiv>
  );
};
