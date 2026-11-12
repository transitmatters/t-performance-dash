import { useMemo, useRef } from 'react';
import { Line } from '@chartjs-components';
import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { watermarkLayout } from '../../../common/constants/charts';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import type { DeliveredTripMetricsBus } from '../../../common/types/dataPoints';
import { HERO_LINE_WIDTH, useChartTheme } from '../../../common/utils/chartTheme';
import { TIME_BANDS } from '../../busspeedmap/constants';
import type { TimeBand } from '../../busspeedmap/types';
import {
  getNoDataSinceLatestAnnotation,
  getShuttlingBlockAnnotations,
} from '../../service/utils/graphUtils';
import { explainGaps, usePageShutdowns } from '../../shutdowns';
import type { ParamsType } from '../constants/speeds';
import { bandMph, flattenBandsForCsv } from '../utils/busSpeedBands';
import { allDayFill, BusSpeedBandLegend, useBandColors } from './BusSpeedBandLegend';

interface BusSpeedGraphProps {
  data: DeliveredTripMetricsBus[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  visible: TimeBand[];
  onVisibleChange: (visible: TimeBand[]) => void;
}

/**
 * Bus speed over time, one line per departure window plus the whole day. All of them come from a
 * single request: every row carries its own `time_bands` breakdown, so showing or hiding a line
 * never refetches.
 */
export const BusSpeedGraph = ({
  data,
  config,
  startDate,
  endDate,
  visible,
  onVisibleChange,
}: BusSpeedGraphProps) => {
  const { tooltipFormat, unit, callbacks } = config;
  const ref = useRef(null);
  const isMobile = !useBreakpoint('md');
  const chartTheme = useChartTheme();
  const colors = useBandColors();
  const anyBandShown = visible.some((key) => key !== 'all_day');
  const csvData = useMemo(() => flattenBandsForCsv(data), [data]);
  const labels = data.map((point) => point.date);
  // Grey "No data" blocks where the whole day had none, the same as the rail graph. A band missing
  // where All day has data is just a gap in that band's line.
  const shutdowns = usePageShutdowns('line', startDate, endDate);
  const gapBlocks = explainGaps(getShuttlingBlockAnnotations(data), shutdowns, {
    startDate,
    endDate,
  });

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Line
          id="speed-bus"
          height={isMobile ? 240 : 200}
          ref={ref}
          data={{
            labels,
            datasets: TIME_BANDS.map(({ key, label }) => {
              const isAllDay = key === 'all_day';
              return {
                label,
                hidden: !visible.includes(key),
                data: data.map((row) => bandMph(row, key)),
                borderColor: colors[key],
                pointHoverBackgroundColor: colors[key],
                pointBackgroundColor: colors[key],
                borderWidth: isAllDay ? HERO_LINE_WIDTH : 2,
                // On its own, All day keeps the filled look the graph has always had. Beside the
                // bands its fill fades to a backdrop, and it draws underneath them (higher order
                // draws first), so the band lines stay on top.
                fill: isAllDay,
                backgroundColor: isAllDay ? allDayFill(colors.all_day, anyBandShown) : colors[key],
                order: isAllDay ? 1 : 0,
                stepped: true,
                spanGaps: false,
                pointRadius: 0,
                pointBorderWidth: 0,
                pointHoverRadius: 5,
              };
            }),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            interaction: { intersect: false, mode: 'index' },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              // The HTML legend below the chart replaces this one.
              legend: { display: false },
              annotation: {
                annotations: [...gapBlocks, ...getNoDataSinceLatestAnnotation(labels)],
              },
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  ...callbacks,
                  hoverCard: (items) => {
                    const shown = items.filter((item) => Number.isFinite(item.parsed.y));
                    if (shown.length === 0) return null;
                    if (visible.length === 1) {
                      const [only] = shown;
                      return {
                        hero: {
                          value: Number(only.parsed.y).toFixed(1),
                          unit: 'mph',
                          caption: TIME_BANDS[only.datasetIndex].label,
                          color: colors[TIME_BANDS[only.datasetIndex].key],
                        },
                      };
                    }
                    // Chronological, All day first, whatever order Chart.js found the points in.
                    return {
                      rows: [...shown]
                        .sort((a, b) => a.datasetIndex - b.datasetIndex)
                        .map((item) => {
                          const band = TIME_BANDS[item.datasetIndex];
                          return {
                            label:
                              band.key === 'all_day' ? band.label : `${band.label} (${band.hours})`,
                            value: `${Number(item.parsed.y).toFixed(1)} mph`,
                            color: colors[band.key],
                          };
                        }),
                    };
                  },
                },
              },
            },
            scales: {
              y: {
                suggestedMin: 0,
                grid: { color: chartTheme.grid },
                border: { color: chartTheme.axisBorder },
                ticks: { color: chartTheme.tick },
                title: { display: true, text: 'Miles per hour (mph)', color: chartTheme.tick },
              },
              x: {
                min: startDate,
                max: endDate,
                type: 'time',
                time: { unit, tooltipFormat, displayFormats: { month: 'MMM' } },
                grid: { color: chartTheme.grid },
                border: { color: chartTheme.axisBorder },
                ticks: { color: chartTheme.tick },
                adapters: { date: { locale: enUS } },
              },
            },
          }}
          plugins={[ChartjsPluginWatermark]}
        />
      </ChartDiv>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <BusSpeedBandLegend visible={visible} colors={colors} onChange={onVisibleChange} />
        <div className="flex shrink-0 flex-row items-end justify-end gap-4">
          <SaveChartImageButton
            chartRef={ref}
            datasetName="speed"
            includeBothStopsForLocation={false}
            startDate={startDate}
            endDate={endDate}
          />
          <DownloadButton
            data={csvData}
            datasetName="speed"
            includeBothStopsForLocation={false}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>
    </ChartStack>
  );
};
