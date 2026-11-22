import { faArrowsRotate, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type { UseQueryResult } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { getErrorCopy } from '../../api/utils/ApiError';
import { Button } from '../ui/button';

interface ErrorNoticeProps {
  query?: UseQueryResult<unknown>;
}

/**
 * Several charts on a page can fail together, so this is `role="status"` rather than `role="alert"` —
 * simultaneous failures should not each interrupt a screen reader. Every branch names the
 * problem and offers the recovery; the error is only ever read to pick a branch (see
 * `getErrorCopy`), never shown, so backend internals stay out of the UI.
 */
export const ErrorNotice = ({ query }: ErrorNoticeProps) => {
  const isRange = useSearch({ strict: false, select: (search) => Boolean(search.startDate) });
  const { title, detail } = getErrorCopy(query?.error, {
    isRange,
    isOnline: navigator.onLine,
  });
  const canRetry = Boolean(query?.refetch);

  return (
    <div
      role="status"
      className="flex h-full flex-col content-center items-center justify-center gap-1 rounded-lg px-4 text-center"
    >
      <FontAwesomeIcon
        size={'2x'}
        icon={faTriangleExclamation}
        className="mb-1 text-destructive/70"
        aria-hidden
      />
      <p className="font-medium text-card-foreground">{title}</p>
      <p className="text-sm text-muted-foreground">{detail}</p>
      {canRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={() => query?.refetch()}
          disabled={query?.isFetching}
        >
          <FontAwesomeIcon
            icon={faArrowsRotate}
            className={classNames(query?.isFetching && 'animate-spin')}
            aria-hidden
          />
          {query?.isFetching ? 'Retrying…' : 'Try again'}
        </Button>
      )}
    </div>
  );
};
