import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type { ChunkedAggregateQueryResult } from '../../types/charts';
import { Button } from '../ui/button';
import { Notice } from './Notice';

interface PartialDataNoticeProps {
  query: ChunkedAggregateQueryResult;
}

/**
 * Shown under a chart once part of its long date range has failed to load. Parts still loading are
 * shaded on the chart itself.
 */
export const PartialDataNotice = ({ query }: PartialDataNoticeProps) => {
  const { chunks } = query;
  if (!chunks?.failed || chunks.pending) return null;

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
