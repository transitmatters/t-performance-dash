import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { round } from 'lodash';

import 'chartjs-adapter-date-fns';
import { enUS } from 'date-fns/locale';

import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import { useDelimitatedRoute } from '../../../common/utils/router';
import { LINE_COLORS } from '../../../common/constants/colors';
import type { DeliveredTripMetrics } from '../../../common/types/dataPoints';
import { drawSimpleTitle } from '../../../common/components/charts/Title';
import { useChartTheme } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import { getShuttlingBlockAnnotations } from '../../service/utils/graphUtils';
import type { ParamsType } from '../../speed/constants/speeds';
import type { FleetType } from '../constants/fleetTypes';
import { getFleetMixValue, hasFleetMix } from '../constants/fleetTypes';

interface FleetMixChartProps {
  data: DeliveredTripMetrics[];
  types: FleetType[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const FleetMixChart: React.FC<FleetMixChartProps> = ({
  data,
  types,
  config,
  startDate,
  endDate,
  showTitle = false,
}) => {
  const { line, linePath } = useDelimitatedRoute();
  const { tooltipFormat, unit, callbacks } = config;
  const ref = useRef(null);
  const chartTheme = useChartTheme();
  const isMobile = !useBreakpoint('md');
  const labels = data.map((point) => point.date);
  const lineColor = LINE_COLORS[line ?? 'default'];
  const shuttlingBlocks = getShuttlingBlockAnnotations(data, (datapoint) =>
    hasFleetMix(datapoint, types)
  );

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`fleet-mix-${linePath}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: types.map((type, index) => {
              const color = hexWithAlpha(lineColor, 0.25 + (0.75 * index) / (types.length - 1));
              return {
                label: `${type.label} (${type.years})`,
                borderColor: lineColor,
                borderWidth: 1,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointBorderWidth: 0,
                stepped: true,
                // Fill to the layer below; filling to zero lets the top layer cover the rest
                fill: index === 0 ? 'origin' : '-1',
                pointHoverBackgroundColor: lineColor,
                backgroundColor: color,
                data: data.map((datapoint) => getFleetMixValue(datapoint, type) ?? null),
              };
            }),
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: {
              padding: {
                top: showTitle ? 25 : 0,
              },
            },
            interaction: {
              intersect: false,
            },
            // @ts-expect-error The watermark plugin doesn't have typescript support
            watermark: watermarkLayout(isMobile),
            plugins: {
              tooltip: {
                mode: 'index',
                position: 'nearest',
                callbacks: {
                  ...callbacks,
                  label: (context) => {
                    if (context.parsed.y === null || context.parsed.y === undefined) return '';
                    return `${types[context.datasetIndex].label}: ${round(context.parsed.y, 1)}%`;
                  },
                },
              },
              legend: {
                position: 'bottom',
                labels: {
                  boxWidth: 15,
                  color: chartTheme.tick,
                },
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: showTitle,
                text: '',
              },
              annotation: {
                annotations: [...shuttlingBlocks],
              },
            },
            scales: {
              y: {
                stacked: true,
                min: 0,
                max: 100,
                display: true,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                  callback: (value) => `${value}%`,
                },
                title: {
                  display: true,
                  text: 'Share of cars',
                  color: chartTheme.tick,
                },
              },
              x: {
                min: startDate,
                max: endDate,
                type: 'time',
                // Vertical rules add noise without helping readers compare values.
                grid: { display: false },
                border: { color: chartTheme.axisBorder },
                time: {
                  unit: unit,
                  tooltipFormat: tooltipFormat,
                  displayFormats: {
                    month: 'MMM',
                  },
                },
                ticks: {
                  color: chartTheme.tick,
                },
                adapters: {
                  date: {
                    locale: enUS,
                  },
                },
                display: true,
                title: {
                  display: false,
                  text: ``,
                },
              },
            },
          }}
          plugins={[
            {
              id: 'customTitle',
              afterDraw: (chart) => {
                if (showTitle) drawSimpleTitle(`Fleet mix`, chart);
              },
            },
            ChartjsPluginWatermark,
          ]}
        />
      </ChartDiv>
      <div className="flex flex-row items-end justify-end gap-4">
        {startDate && (
          <>
            <SaveChartImageButton
              chartRef={ref}
              datasetName="fleet-mix"
              includeBothStopsForLocation={false}
              startDate={startDate}
              endDate={endDate}
            />
            <DownloadButton
              data={data}
              datasetName="fleet-mix"
              includeBothStopsForLocation={false}
              startDate={startDate}
              endDate={endDate}
            />
          </>
        )}
      </div>
    </ChartStack>
  );
};
