import { faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import type { TripMetric } from '../../utils/dataCoverage';
import { getNoDataReason } from '../../utils/dataCoverage';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import { Button } from '../ui/button';

interface NoDataNoticeProps {
  isWidget?: boolean;
  inverse?: boolean;
  isLineMetric?: boolean;
  /** The query returned data, but the chart's day or peak filter removed all of it. */
  filtered?: boolean;
  /** Which trip chart this is, for coverage gaps that only affect some charts. */
  metric?: TripMetric;
  /** Replaces the detail line when the caller knows better, e.g. the dates fall outside service. */
  message?: string;
}

/**
 * An empty result is not an error: the query worked, the T just ran nothing matching it. The icon is
 * a chart-with-magnifier rather than the warning triangle `ErrorNotice` uses, so "nothing here" and
 * "something broke" stay visually distinct, and it is muted rather than line-colored — the line
 * colors are brand tokens tuned for fills, and bus yellow lands at 1.8:1 as 3x text on a card.
 * The copy says why the chart is empty when we can tell (see `getNoDataReason`).
 */
export const NoDataNotice = ({
  isWidget,
  inverse,
  isLineMetric = false,
  filtered = false,
  metric,
  message,
}: NoDataNoticeProps) => {
  const { tab, query } = useDelimitatedRoute();
  const updateQueryParams = useUpdateQuery();
  const { title, detail, jumpTo, jumpLabel } = getNoDataReason({
    tab,
    metric,
    date: query.date,
    startDate: query.startDate,
    endDate: query.endDate,
    isLineMetric,
    filtered,
  });

  return (
    <div className="relative flex h-60 w-full items-center justify-center">
      <div
        className={classNames(
          'flex h-full max-w-md flex-col content-center items-center justify-center gap-1 rounded-lg px-4 text-center',
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
          {title}
        </p>
        <p className={classNames('text-sm', inverse ? 'text-white/80' : 'text-muted-foreground')}>
          {message ?? detail}
        </p>
        {jumpTo && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => updateQueryParams(jumpTo, false)}
          >
            {jumpLabel}
          </Button>
        )}
      </div>
    </div>
  );
};
