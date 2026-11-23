import { useId, useMemo } from 'react';
import dayjs from 'dayjs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faGaugeSimpleHigh } from '@fortawesome/free-solid-svg-icons';
import { useSlowzoneAllData } from '../../common/api/hooks/slowzones';
import { Link } from '../../common/components/general/Link';
import { Badge } from '../../common/components/ui/badge';
import { buttonVariants } from '../../common/components/ui/button';
import { Card } from '../../common/components/ui/card';
import { Switch } from '../../common/components/ui/switch';
import { DeltaBadge } from '../../common/components/widgets/StatCard';
import { DATE_FORMAT, PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import { useDisplayStore } from '../../common/state/displayStore';
import type { LinePath } from '../../common/types/lines';
import type { Station } from '../../common/types/stations';
import { getTripSlowZoneSummary } from '../../common/utils/slowZoneUtils';
import { rangeEndsDetail, statDelta } from '../../common/utils/statDelta';
import { getFormattedTimeString } from '../../common/utils/time';
import type { SlowZonesLineName } from './types';
import { cn } from '@/common/utils/cn';

interface TripSlowZonesCalloutProps {
  fromStation: Station;
  toStation: Station;
  lineShort: SlowZonesLineName;
  linePath: LinePath;
  startDate: string;
  endDate: string;
  /** Offer a switch for the slow zones row under the charts, which only date ranges have. */
  withChartToggle?: boolean;
}

const formatDate = (date: string) => dayjs(date).format(PRETTY_DATE_FORMAT);
const figure = 'font-semibold text-foreground tabular-nums';

/**
 * How much time slow zones added between the trip's two stops, above the trip charts. Renders
 * nothing when the segment had no slow zones in the selected dates.
 */
export const TripSlowZonesCallout = ({
  fromStation,
  toStation,
  lineShort,
  linePath,
  startDate,
  endDate,
  withChartToggle = false,
}: TripSlowZonesCalloutProps) => {
  const switchId = useId();
  const showOnCharts = useDisplayStore((state) => state.showSlowZones);
  const setShowOnCharts = useDisplayStore((state) => state.setShowSlowZones);
  const { data } = useSlowzoneAllData();
  const summary = useMemo(
    () =>
      data && getTripSlowZoneSummary(data, fromStation, toStation, lineShort, startDate, endDate),
    [data, fromStation, toStation, lineShort, startDate, endDate]
  );
  if (!summary) return null;

  const isRange = summary.startDate !== summary.endDate;
  const cleared = summary.endTotal <= 0;
  const zones = `${summary.endZones} ${summary.endZones === 1 ? 'zone' : 'zones'}`;
  const delta =
    isRange && !cleared && summary.endTotal !== summary.startTotal
      ? statDelta({
          delta: summary.endTotal - summary.startTotal,
          negligible: 0,
          magnitude: `${summary.endTotal >= summary.startTotal ? '+' : '−'}${getFormattedTimeString(summary.endTotal - summary.startTotal)}`,
          words: ['better', 'worse'],
          higherIsBetter: false,
          detail: rangeEndsDetail(summary.startTotal, summary.endTotal, getFormattedTimeString),
        })
      : undefined;
  const showPeak = isRange && summary.peakTotal > summary.endTotal;
  // A single day still gets a year of history on the slow zones page.
  const linkStart = isRange
    ? summary.startDate
    : dayjs(summary.endDate).subtract(1, 'year').format(DATE_FORMAT);

  return (
    <Card
      size="sm"
      aria-label="Slow zones on this trip"
      className="flex-row flex-wrap items-center gap-x-6 gap-y-3 px-(--card-spacing)"
    >
      <div className="flex min-w-0 flex-1 basis-80 items-start gap-3">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <FontAwesomeIcon icon={faGaugeSimpleHigh} className="size-4" />
        </span>
        <div className="flex min-w-0 flex-col gap-1">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xl font-semibold tabular-nums">
              {getFormattedTimeString(cleared ? summary.peakTotal : summary.endTotal)}
            </span>
            <span className="text-muted-foreground">
              {cleared
                ? `added by slow zones at their peak, on ${formatDate(summary.peakDate)}`
                : `added by ${zones} on ${formatDate(summary.endDate)}`}
            </span>
          </p>
          {(delta || showPeak || cleared) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground">
              {cleared && <Badge variant="success">Cleared</Badge>}
              {cleared && <span>All had cleared by {formatDate(summary.endDate)}</span>}
              {delta && (
                <span className="flex items-center gap-1.5">
                  <DeltaBadge delta={delta} />
                  since {formatDate(summary.startDate)}
                </span>
              )}
              {showPeak && !cleared && (
                <span>
                  Peak <span className={figure}>{getFormattedTimeString(summary.peakTotal)}</span>{' '}
                  on {formatDate(summary.peakDate)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2">
        {withChartToggle && (
          <label htmlFor={switchId} className="flex cursor-pointer items-center gap-2">
            <Switch id={switchId} checked={showOnCharts} onCheckedChange={setShowOnCharts} />
            Show on charts
          </label>
        )}
        <Link
          href={{
            pathname: `/${linePath}/slowzones`,
            query: { startDate: linkStart, endDate: summary.endDate },
          }}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          View slow zones
          <FontAwesomeIcon icon={faChevronRight} aria-hidden />
        </Link>
      </div>
    </Card>
  );
};
