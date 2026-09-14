import { faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import React from 'react';

interface NoDataNoticeProps {
  isWidget?: boolean;
  inverse?: boolean;
  isLineMetric?: boolean;
}

/**
 * An empty result is not an error: the query worked, the T just ran nothing matching it. The icon is
 * a chart-with-magnifier rather than the warning triangle `ErrorNotice` uses, so "nothing here" and
 * "something broke" stay visually distinct, and it is muted rather than line-colored — the line
 * colors are brand tokens tuned for fills, and bus yellow lands at 1.8:1 as 3x text on a card.
 */
export const NoDataNotice: React.FC<NoDataNoticeProps> = ({
  isWidget,
  inverse,
  isLineMetric: isLineWide = false,
}) => {
  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      <div
        className={classNames(
          'flex h-full flex-col content-center items-center justify-center gap-1 rounded-lg px-4 text-center',
          isWidget ? 'bg-card p-2' : ''
        )}
      >
        <FontAwesomeIcon
          size={'2x'}
          icon={faMagnifyingGlassChart}
          className={classNames('mb-1', inverse ? 'text-white/50' : 'text-muted-foreground/50')}
          aria-hidden
        />
        <p className={classNames('font-medium', inverse ? 'text-white' : 'text-card-foreground')}>
          No data available
        </p>
        <p className={classNames('text-sm', inverse ? 'text-white/80' : 'text-muted-foreground')}>
          {isLineWide ? 'Try another date range.' : 'Try another station pair or date range.'}
        </p>
      </div>
    </div>
  );
};
