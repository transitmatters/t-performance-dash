import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useSlowzoneAllData } from '../../common/api/hooks/slowzones';
import { Link } from '../../common/components/general/Link';
import { DATE_FORMAT } from '../../common/constants/dates';
import { lineColorVar } from '../../common/styles/general';
import type { Line, LinePath } from '../../common/types/lines';
import type { Station } from '../../common/types/stations';
import { prettyDate } from '../../common/utils/date';
import { getTripSlowZoneSummary } from '../../common/utils/slowZoneUtils';
import { getFormattedTimeString } from '../../common/utils/time';
import type { SlowZonesLineName } from './types';

interface TripSlowZonesCalloutProps {
  fromStation: Station;
  toStation: Station;
  lineShort: SlowZonesLineName;
  line?: Line;
  linePath: LinePath;
  startDate: string;
  endDate: string;
}

/**
 * How much time slow zones added between the trip's two stops, above the trip charts. Renders
 * nothing when the segment had no slow zones in the selected dates.
 */
export const TripSlowZonesCallout = ({
  fromStation,
  toStation,
  lineShort,
  line,
  linePath,
  startDate,
  endDate,
}: TripSlowZonesCalloutProps) => {
  const { data } = useSlowzoneAllData();
  const summary = useMemo(
    () =>
      data &&
      getTripSlowZoneSummary(data.data, fromStation, toStation, lineShort, startDate, endDate),
    [data, fromStation, toStation, lineShort, startDate, endDate]
  );
  if (!summary) return null;

  const isRange = summary.startDate !== summary.endDate;
  const trip = `from ${fromStation.stop_name} to ${toStation.stop_name}`;
  const zones = `${summary.endZones} ${summary.endZones === 1 ? 'zone' : 'zones'}`;
  const delta = summary.endTotal - summary.startTotal;
  // A single day still gets a year of history on the slow zones page.
  const linkStart = isRange
    ? summary.startDate
    : dayjs(summary.endDate).subtract(1, 'year').format(DATE_FORMAT);

  return (
    <div
      style={lineColorVar(line)}
      className="flex flex-col gap-x-4 gap-y-1 rounded-lg border border-(--line-color)/40 bg-(--line-color)/10 px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm leading-snug">
        {summary.endTotal > 0 ? (
          <>
            On {prettyDate(summary.endDate)}, slow zones added{' '}
            <b className="font-semibold">{getFormattedTimeString(summary.endTotal)}</b> to trips{' '}
            {trip} ({zones})
            {isRange && delta !== 0 && (
              <>
                , {delta > 0 ? 'up' : 'down'} {getFormattedTimeString(delta)} from{' '}
                {prettyDate(summary.startDate)}
              </>
            )}
            .
            {isRange && summary.peakTotal > summary.endTotal && (
              <>
                {' '}
                They peaked at{' '}
                <b className="font-semibold">{getFormattedTimeString(summary.peakTotal)}</b> on{' '}
                {prettyDate(summary.peakDate)}.
              </>
            )}
          </>
        ) : (
          <>
            Between {prettyDate(summary.startDate)} and {prettyDate(summary.endDate)}, slow zones
            added up to <b className="font-semibold">{getFormattedTimeString(summary.peakTotal)}</b>{' '}
            to trips {trip}, peaking on {prettyDate(summary.peakDate)}. All had cleared by{' '}
            {prettyDate(summary.endDate)}.
          </>
        )}
      </p>
      <Link
        href={{
          pathname: `/${linePath}/slowzones`,
          query: { startDate: linkStart, endDate: summary.endDate },
        }}
        className="shrink-0 text-sm font-medium underline underline-offset-2"
      >
        View slow zones
      </Link>
    </div>
  );
};
