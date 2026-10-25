import React from 'react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { Link } from '../../common/components/general/Link';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import { normalizeDateParams } from '../../common/utils/dateParams';
import { linePathToKeyMap, useQueryParams } from '../../common/utils/router';
import { TotalSlowTime } from './charts/TotalSlowTime';
import type { SlowZonesEmbedLine } from './embed';
import { getSlowZonesEmbedTitle, getSlowZonesPageUrl } from './embed';

dayjs.extend(utc);

interface SlowZonesEmbedProps {
  line: SlowZonesEmbedLine;
}

/** The total slow time chart on its own, for iframing into articles. */
export const SlowZonesEmbed: React.FC<SlowZonesEmbedProps> = ({ line }) => {
  const search = useQueryParams();
  const delayTotals = useSlowzoneDelayTotalData();

  const isSystem = line === 'system';
  const lineKey = isSystem ? undefined : linePathToKeyMap[line];
  // Fill in or fix the dates without rewriting the URL, so an embed with no dates keeps showing
  // the latest range instead of pinning whichever day it was first loaded.
  const dates =
    normalizeDateParams(
      isSystem
        ? { section: 'system', tab: 'System', page: 'systemSlowzones', search }
        : { section: 'line', tab: 'Subway', page: 'slowzones', search }
    ) ?? search;
  const startDate = dates.startDate as string;
  const endDate = dates.endDate as string;
  const startDateUTC = dayjs.utc(startDate).startOf('day');
  const endDateUTC = dayjs.utc(endDate).startOf('day');
  const title = getSlowZonesEmbedTitle(line);

  return (
    <div className="flex h-full flex-col gap-2 bg-card p-3 text-card-foreground">
      <title>{`${title} | Data Dashboard`}</title>
      <meta name="robots" content="noindex" />
      <div className="flex flex-col gap-0.5">
        <h1 className="text-base leading-snug font-semibold">{title}</h1>
        <p className="text-[13px] leading-tight text-muted-foreground">
          Time over baseline · {startDateUTC.format(PRETTY_DATE_FORMAT)} –{' '}
          {endDateUTC.format(PRETTY_DATE_FORMAT)}
        </p>
      </div>
      <div className="min-h-0 flex-1">
        {delayTotals.data ? (
          <TotalSlowTime
            data={Array.isArray(delayTotals.data) ? delayTotals.data : delayTotals.data.data}
            startDateUTC={startDateUTC}
            endDateUTC={endDateUTC}
            line={lineKey}
            lineShort={lineKey ? LINE_OBJECTS[lineKey].short : undefined}
            showTitle={false}
            fill
          />
        ) : (
          <ChartPlaceHolder query={delayTotals} />
        )}
      </div>
      <Link
        href={getSlowZonesPageUrl(line, { startDate, endDate })}
        target="_blank"
        rel="noopener"
        className="self-end text-xs text-muted-foreground hover:underline"
      >
        View on the TransitMatters Data Dashboard ↗
      </Link>
    </div>
  );
};
