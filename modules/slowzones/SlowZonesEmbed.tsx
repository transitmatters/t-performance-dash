import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

import { useSlowzoneDelayTotalData } from '../../common/api/hooks/slowzones';
import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
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
export const SlowZonesEmbed = ({ line }: SlowZonesEmbedProps) => {
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

  return (
    <EmbedFrame
      title={getSlowZonesEmbedTitle(line)}
      subtitle={`Time over baseline · ${startDateUTC.format(PRETTY_DATE_FORMAT)} – ${endDateUTC.format(PRETTY_DATE_FORMAT)}`}
      href={getSlowZonesPageUrl(line, { startDate, endDate })}
    >
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
    </EmbedFrame>
  );
};
