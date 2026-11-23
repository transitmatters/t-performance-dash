import dayjs from 'dayjs';

import { useSearch } from '@tanstack/react-router';
import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import type { DelaysEmbedChart } from '../../common/constants/staticRoutes';
import { useLinePage } from '../../common/hooks/usePageParams';
import { canonicalDateRange } from '../../common/utils/dateParams';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { DelayCauseBars } from './charts/DelayCauseBars';
import { DelayTotalBars } from './charts/DelayTotalBars';
import { getDelaysEmbedTitle, getDelaysPageUrl } from './embed';
import { useDelays } from './useDelays';
import { useFocusedReason } from './useFocusedReason';

/** One Delays page chart on its own, for iframing into articles. */
export const DelaysChartEmbed = ({ chart }: { chart: DelaysEmbedChart }) => {
  const { line, linePath, tab } = useLinePage();
  const query = useSearch({ from: '/embed/$line/delays/$chart' });
  // Fills in missing or out-of-range dates without rewriting the URL, as the slow zone embed does.
  const { startDate, endDate } = canonicalDateRange({
    section: 'line',
    tab,
    page: 'delays',
    search: query,
  });
  const { alertDelays, agg, period, isActual, delayData, series, rangeData, rangeQueries } =
    useDelays(startDate, endDate);
  const { focus } = useFocusedReason();
  const mode = query.dlView === 'share' ? 'share' : 'minutes';

  const renderChart = () => {
    if (!delayData) return <ChartPlaceHolder query={alertDelays} />;
    const props = { data: delayData, startDate, endDate, fill: true };
    switch (chart) {
      case 'total':
        return <DelayTotalBars agg={agg} focus={focus} {...props} />;
      case 'causes':
        // Totals for exactly these dates, so this waits for the days at either end too
        if (!rangeData) {
          return <ChartPlaceHolder query={rangeQueries.find((rangeQuery) => !rangeQuery.data)} />;
        }
        return <DelayCauseBars focus={focus} {...props} data={rangeData} />;
      case 'breakdown':
        return (
          <DelayBreakdownGraph
            series={series}
            mode={mode}
            agg={agg}
            summary="Delay time by cause over the selected dates"
            {...props}
          />
        );
    }
  };

  const detail = {
    total: isActual
      ? `Minutes a delay alert was up, per ${period}`
      : `Minutes delayed per ${period}, from rider alerts`,
    causes: 'Total delay time by cause',
    breakdown:
      mode === 'share'
        ? `Each ${period} as a share of all delay time`
        : `Each cause, in minutes per ${period}`,
  }[chart];
  const when = `${dayjs(startDate).format(PRETTY_DATE_FORMAT)} – ${dayjs(endDate).format(PRETTY_DATE_FORMAT)}`;

  return (
    <EmbedFrame
      title={getDelaysEmbedTitle(chart, { line, query })}
      subtitle={`${detail} · ${when}`}
      href={getDelaysPageUrl(chart, { linePath, query: { ...query, startDate, endDate } })}
    >
      {renderChart()}
    </EmbedFrame>
  );
};
