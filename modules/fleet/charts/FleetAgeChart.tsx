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
import { HERO_LINE_WIDTH, useChartTheme } from '../../../common/utils/chartTheme';
import { hexWithAlpha } from '../../../common/utils/general';
import { useBreakpoint } from '../../../common/hooks/useBreakpoint';
import { watermarkLayout } from '../../../common/constants/charts';
import { ChartStack } from '../../../common/components/charts/ChartStack';
import { ChartDiv } from '../../../common/components/charts/ChartDiv';
import { DownloadButton } from '../../../common/components/buttons/DownloadButton';
import { SaveChartImageButton } from '../../../common/components/buttons/SaveChartImageButton';
import type { ParamsType } from '../../speed/constants/speeds';

interface FleetAgeChartProps {
  data: DeliveredTripMetrics[];
  config: ParamsType;
  startDate: string;
  endDate: string;
  showTitle?: boolean;
}

export const FleetAgeChart: React.FC<FleetAgeChartProps> = ({
  data,
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

  return (
    <ChartStack>
      <ChartDiv isMobile={isMobile}>
        <Line
          id={`fleet-age-${linePath}`}
          height={isMobile ? 240 : 200}
          ref={ref}
          redraw={true}
          data={{
            labels,
            datasets: [
              {
                label: 'Average car age (years)',
                fill: true,
                backgroundColor: hexWithAlpha(lineColor, 0.8),
                borderColor: lineColor,
                borderWidth: HERO_LINE_WIDTH,
                pointRadius: 0,
                pointBorderWidth: 0,
                stepped: true,
                pointHoverRadius: 6,
                spanGaps: false,
                pointHoverBackgroundColor: lineColor,
                pointBackgroundColor: lineColor,
                data: data.map((datapoint) => datapoint.avg_car_age ?? null),
              },
            ],
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
                    return `${round(context.parsed.y, 2)} years`;
                  },
                },
              },
              // A single series, already named by the card title.
              legend: {
                display: false,
              },
              title: {
                // empty title to set font and leave room for drawTitle fn
                display: showTitle,
                text: '',
              },
            },
            scales: {
              y: {
                suggestedMin: 0,
                display: true,
                border: { display: false },
                grid: { color: chartTheme.grid },
                ticks: {
                  color: chartTheme.tick,
                },
                title: {
                  display: true,
                  text: 'Average car age (years)',
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
                if (showTitle) drawSimpleTitle(`Average car age`, chart);
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
              datasetName="fleet-car-age"
              includeBothStopsForLocation={false}
              startDate={startDate}
              endDate={endDate}
            />
            <DownloadButton
              data={data}
              datasetName="fleet-car-age"
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
