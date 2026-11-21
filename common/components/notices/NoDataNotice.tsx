import { faMagnifyingGlassChart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { TripMetric } from '../../utils/dataCoverage';
import { getNoDataReason } from '../../utils/dataCoverage';
import { useDelimitatedRoute, useUpdateQuery } from '../../utils/router';
import { Button } from '../ui/button';
import { usePageShutdowns, shutdownDates } from '../../../modules/shutdowns';

interface NoDataNoticeProps {
  isLineMetric?: boolean;
  /** The query returned data, but the chart's day or peak filter removed all of it. */
  filtered?: boolean;
  /** Which trip chart this is, for coverage gaps that only affect some charts. */
  metric?: TripMetric;
  /** Names the shutdowns on the page's line and dates that explain the missing data. */
  shutdownScope?: 'line' | 'trip';
  /** Replaces the detail line when the caller knows better, e.g. the dates fall outside service. */
  message?: string;
}

const ShutdownExplanation = ({ scope }: { scope: 'line' | 'trip' }) => {
  const shutdowns = usePageShutdowns(scope);
  if (shutdowns.length === 0) return null;
  return (
    <ul className="text-sm text-card-foreground">
      {shutdowns.slice(0, 2).map((view) => (
        <li key={view.shutdown.alert_id}>
          {view.label} · {shutdownDates(view)}
        </li>
      ))}
      {shutdowns.length > 2 && <li>and {shutdowns.length - 2} more shutdowns</li>}
    </ul>
  );
};

/**
 * An empty result is not an error: the query worked, the T just ran nothing matching it. The icon is
 * a chart-with-magnifier rather than the warning triangle `ErrorNotice` uses, so "nothing here" and
 * "something broke" stay visually distinct, and it is muted rather than line-colored — the line
 * colors are brand tokens tuned for fills, and bus yellow lands at 1.8:1 as 3x text on a card.
 * The copy says why the chart is empty when we can tell (see `getNoDataReason`).
 */
export const NoDataNotice = ({
  isLineMetric = false,
  filtered = false,
  metric,
  shutdownScope,
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
      <div className="flex h-full max-w-md flex-col content-center items-center justify-center gap-1 rounded-lg px-4 text-center">
        <FontAwesomeIcon
          size={'2x'}
          icon={faMagnifyingGlassChart}
          className="mb-1 text-muted-foreground/50"
          aria-hidden
        />
        <p className="font-medium text-card-foreground">{title}</p>
        {shutdownScope && !filtered && <ShutdownExplanation scope={shutdownScope} />}
        <p className="text-sm text-muted-foreground">{message ?? detail}</p>
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
