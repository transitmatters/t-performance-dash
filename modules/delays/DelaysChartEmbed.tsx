import dayjs from 'dayjs';

import { EmbedFrame } from '../../common/components/embed/EmbedFrame';
import { ChartPlaceHolder } from '../../common/components/graphics/ChartPlaceHolder';
import { PRETTY_DATE_FORMAT } from '../../common/constants/dates';
import type { DelaysEmbedChart } from '../../common/constants/staticRoutes';
import { normalizeDateParams } from '../../common/utils/dateParams';
import { useDelimitatedRoute } from '../../common/utils/router';
import { DelayBreakdownGraph } from './charts/DelayBreakdownGraph';
import { DelayCauseBars } from './charts/DelayCauseBars';
import { DelayTotalBars } from './charts/DelayTotalBars';
import { getDelaysEmbedTitle, getDelaysPageUrl } from './embed';
import { useDelays } from './useDelays';
import { useFocusedReason } from './useFocusedReason';

/** One Delays page chart on its own, for iframing into articles. */
export const DelaysChartEmbed = ({ chart }: { chart: DelaysEmbedChart }) => {
  const route = useDelimitatedRoute();
  const { tab, query } = route;
  // Fills in missing or out-of-range dates without rewriting the URL, as the slow zone embed does.
  const dates = {
    ...query,
    ...normalizeDateParams({ section: 'line', tab, page: 'delays', search: query }),
  };
  const startDate = dates.startDate as string;
  const endDate = dates.endDate as string;
  const { alertDelays, agg, period, isActual, delayData, series } = useDelays(startDate, endDate);
  const { focus } = useFocusedReason();
  const mode = query.dlView === 'share' ? 'share' : 'minutes';

  const renderChart = () => {
    if (!delayData) return <ChartPlaceHolder query={alertDelays} />;
    const props = { data: delayData, startDate, endDate, fill: true };
    switch (chart) {
      case 'total':
        return <DelayTotalBars agg={agg} focus={focus} {...props} />;
      case 'causes':
        return <DelayCauseBars focus={focus} {...props} />;
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
      title={getDelaysEmbedTitle(chart, route)}
      subtitle={`${detail} · ${when}`}
      href={getDelaysPageUrl(chart, { ...route, query: dates })}
    >
      {renderChart()}
    </EmbedFrame>
  );
};
