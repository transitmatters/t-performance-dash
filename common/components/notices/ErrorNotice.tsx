import { faArrowsRotate, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/button';

interface ErrorNoticeProps {
  query?: UseQueryResult<unknown>;
  isWidget?: boolean;
  inverse?: boolean;
}

/**
 * A failed chart is one card of four, so this is `role="status"` rather than `role="alert"` — four
 * simultaneous failures should not interrupt a screen reader four times. Every branch names the
 * problem and offers the recovery; `query.error.message` is only ever read to pick a branch, never
 * shown, so backend internals stay out of the UI.
 */
export const ErrorNotice: React.FC<ErrorNoticeProps> = ({ isWidget, inverse, query }) => {
  const { t } = useTranslation();
  const errorMessage = query?.error?.['message'];
  const timeout = errorMessage === 'network request failed';
  const canRetry = Boolean(query?.refetch);

  return (
    <div
      role="status"
      className={classNames(
        'flex h-full flex-col content-center items-center justify-center gap-1 rounded-lg px-4 text-center',
        isWidget ? 'bg-card p-2' : ''
      )}
    >
      <FontAwesomeIcon
        size={'2x'}
        icon={faTriangleExclamation}
        className={classNames('mb-1', inverse ? 'text-white/60' : 'text-destructive/70')}
        aria-hidden
      />
      <p className={classNames('font-medium', inverse ? 'text-white' : 'text-card-foreground')}>
        {timeout ? t('notices.error.timeoutTitle') : t('notices.error.title')}
      </p>
      <p className={classNames('text-sm', inverse ? 'text-white/80' : 'text-muted-foreground')}>
        {timeout ? t('notices.error.timeoutHint') : t('notices.error.hint')}
      </p>
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
          {query?.isFetching ? t('notices.error.retrying') : t('notices.error.retry')}
        </Button>
      )}
    </div>
  );
};
