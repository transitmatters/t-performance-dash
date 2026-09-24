import React, { useState } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import type { LinkProps } from 'next/link';
import { ErrorBoundary } from 'react-error-boundary';

import type { Line } from '../../types/lines';
import type { Page } from '../../constants/pages';
import { ChartPlaceHolder } from '../graphics/ChartPlaceHolder';
import { WidgetDiv } from './WidgetDiv';
import { WidgetTitle } from './WidgetTitle';

type ReadyDependency = unknown | UseQueryResult;
type ReadyState = 'ready' | 'waiting' | 'error';

interface Props {
  ready?: ReadyDependency | ReadyDependency[];
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** A control that acts on this card's chart — a view switch or a filter. */
  action?: React.ReactNode;
  /** When set, the title becomes a chevron link to this page, colored by line. */
  tab?: Page;
  /** A pre-resolved chevron-link href, for cases where `tab` can't express the target (e.g. a route/date-specific link). */
  titleHref?: null | LinkProps['href'];
  line?: Line;
  /** Content rendered between the title and the ready-gated children, always shown. */
  details?: React.ReactNode;
  className?: string;
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
  const {
    title,
    subtitle,
    action,
    tab,
    titleHref,
    line,
    details,
    className,
    children,
    ready: readyDependencies,
  } = props;
  const [hasError, setHasError] = useState<boolean>();

  const readyState = hasError
    ? 'error'
    : readyDependencies
      ? getReadyState(readyDependencies)
      : 'ready';

  return (
    <WidgetDiv className={className}>
      <WidgetTitle
        title={title}
        subtitle={subtitle}
        action={action}
        tab={tab}
        titleHref={titleHref}
        line={line}
      />
      {details}
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
