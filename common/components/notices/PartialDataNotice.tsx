import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type { FC } from 'react';
import type { ChunkedAggregateQueryResult } from '../../types/charts';
import { Button } from '../ui/button';
import { Notice } from './Notice';

interface PartialDataNoticeProps {
  query: ChunkedAggregateQueryResult;
}

/** Shown under a chart whose long date range is still arriving in pieces, or partly failed. */
export const PartialDataNotice: FC<PartialDataNoticeProps> = ({ query }) => {
  const { chunks } = query;
  if (!chunks || (!chunks.pending && !chunks.failed)) return null;

  if (chunks.pending) {
    return (
      <Notice>
        Loading the rest of this date range ({chunks.loaded} of {chunks.total} parts loaded).
      </Notice>
    );
  }

  return (
    <Notice variant="warning">
      <p>Part of this date range didn't load, so the chart has gaps.</p>
      <Button
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => query.refetch()}
        disabled={query.isFetching}
      >
        <FontAwesomeIcon
          icon={faArrowsRotate}
          className={classNames(query.isFetching && 'animate-spin')}
          aria-hidden
        />
        {query.isFetching ? 'Retrying…' : 'Try again'}
      </Button>
    </Notice>
  );
};
