import React, { useMemo } from 'react';
import { Line as LineChart } from 'react-chartjs-2';
import ChartjsPluginWatermark from 'chartjs-plugin-watermark';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  BarElement,
  BarController,
  LineController,
} from 'chart.js';
import Annotation from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import 'chartjs-adapter-date-fns';
import type { ChartData } from 'chart.js';

import { enUS } from 'date-fns/locale';
import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { ChartDiv } from '../ChartDiv';
import { CHART_COLORS, COLORS } from '../../../constants/colors';

import { watermarkLayout } from '../../../constants/charts';
import type {
  AppliedDisplayStyle,
  Benchmark,
  Block,
  DataPoint,
  Dataset,
  DisplayStyle,
  GridOptions,
  LegendOptions,
  ProvidedTimeAxis,
  ResolvedTimeAxis,
  ValueAxis,
} from './types';
import {
  mergeAndApplyStyles,
  getLabelsForData,
  getFillProps,
  getGranularityForAgg,
  getDefaultTimeAxis,
} from './helpers';

ChartJS.register(
  BarController,
  BarElement,
  LineController,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Annotation,
  ChartDataLabels,
  Filler,
  Title,
  Tooltip,
  Legend
);

interface Props<Data extends Dataset[]> {
  data: Data;
  benchmarks?: Benchmark[];
  blocks?: Block[];
  legend?: LegendOptions;
  grid?: GridOptions;
  style?: Partial<DisplayStyle<Data[number]['data'][number]>>;
  timeAxis?: Partial<ProvidedTimeAxis>;
  valueAxis: ValueAxis;
  height?: number;
}

export const TimeSeriesChart = <Data extends Dataset[]>(props: Props<Data>) => {
  const {
    data,
    style: globalStyle,
    timeAxis: providedTimeAxis = {},
    valueAxis,
    benchmarks = [],
    blocks = [],
    grid = { zIndex: 0 },
    legend = { visible: true },
    height,
  } = props;

  const isMobile = !useBreakpoint('md');

  const appliedStyles = useMemo(() => {
    const styles: Map<Dataset, AppliedDisplayStyle<DataPoint>> = new Map();
    data.forEach((dataset) => {
      const appliedStyle = mergeAndApplyStyles([globalStyle, dataset.style], dataset.data);
      styles.set(dataset, appliedStyle);
    });
    return styles;
  }, [data, globalStyle]);

  const chartJsData: ChartData<'line', number[], string> = useMemo(() => {
    const labels = getLabelsForData(data);
    const datasets = data.map((dataset) => {
      const style = appliedStyles.get(dataset)!;
      const data = dataset.data.map((point) => point.value);
      const { color, width, pointRadius, pointHitRadius, stepped, tension } = style;
      return {
        label: dataset.label,
        borderColor: color,
        borderWidth: width,
        pointRadius: pointRadius,
        pointHitRadius: pointHitRadius,
        stepped,
        tension,
        data,
        pointBorderWidth: 0,
        pointHoverBorderWidth: 0,
        ...getFillProps(style),
      };
    });
    const benchmarkDummyDatasets = benchmarks.map((benchmark) => {
      const color = benchmark.color || CHART_COLORS.ANNOTATIONS;
      return {
        label: benchmark.label,
        backgroundColor: 'transparent',
        borderColor: color,
        data: null as unknown as number[],
      };
    });
    return { labels, datasets: [...datasets, ...benchmarkDummyDatasets] };
  }, [data, benchmarks, appliedStyles]);

  const timeAxis = useMemo((): ResolvedTimeAxis => {
    const providedGranularity =
      'granularity' in providedTimeAxis
        ? providedTimeAxis.granularity
        : 'agg' in providedTimeAxis && providedTimeAxis.agg
          ? getGranularityForAgg(providedTimeAxis.agg)
          : null;
    return { ...getDefaultTimeAxis(providedGranularity ?? null), ...providedTimeAxis };
  }, [providedTimeAxis]);

  const scales = useMemo(() => {
    const unit = timeAxis.axisUnit ?? timeAxis.granularity;
    const time = unit !== 'time' && {
      unit,
      tooltipFormat: timeAxis.tooltipFormat ?? timeAxis.format,
      displayFormats: {
        [unit]: timeAxis.format,
      },
    };

    return {
      x: {
        min: timeAxis.from,
        max: timeAxis.to,
        display: true,
        type: 'time' as const,
        adapters: {
          date: {
            locale: enUS,
          },
        },
        ticks: {
          color: COLORS.design.subtitleGrey,
        },
        grid: {
          z: grid.zIndex,
        },
        ...(time ? { time } : {}),
      },
      y: {
        min: valueAxis.min,
        max: valueAxis.max,
        display: true,
        title: {
          display: !!valueAxis.label,
          text: valueAxis.label ?? '',
          color: COLORS.design.subtitleGrey,
        },
        ticks: {
          color: COLORS.design.subtitleGrey,
          callback: valueAxis.renderTickLabel,
        },
        grid: {
          z: grid.zIndex,
        },
      },
    };
  }, [timeAxis, valueAxis, grid.zIndex]);

  const chartJsOptions = useMemo(() => {
    const benchmarkAnnotations = benchmarks.map((benchmark, index) => {
      const datasetIndex = data.length + index;
      return {
        type: 'line' as const,
        yMin: benchmark.value,
        yMax: benchmark.value,
        borderColor: benchmark.color || CHART_COLORS.ANNOTATIONS,
        display: (ctx) => ctx.chart.isDatasetVisible(datasetIndex),
        borderWidth: 2,
      };
    });

    const blockAnnotations = blocks.map((block) => {
      const { from, to, fillColor, textColor, label } = block;
      return {
        type: 'box' as const,
        xMin: from,
        xMax: to,
        backgroundColor: fillColor || CHART_COLORS.BLOCKS_SOLID,
        borderWidth: 0,
        label: {
          content: label || 'No data',
          rotation: -90,
          color: textColor || 'white',
          display: true,
        },
      };
    });

    return {
      scales,
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
      },
      watermark: watermarkLayout(isMobile),
      plugins: {
        datalabels: {
          display: false,
        },
        tooltip: {
          mode: 'index' as const,
          position: 'nearest' as const,
          callbacks: {
            title: (datasets) => {
              const { label } = datasets[0];
              if (timeAxis.granularity === 'week') {
                return `Week of ${label}`;
              }
              return label;
            },
            label: (context) => {
              const dataset = data[context.datasetIndex];
              const style = appliedStyles.get(dataset)!;
              const point = dataset.data[context.dataIndex];
              if (style.tooltipLabel) {
                return style.tooltipLabel(point, context);
              }
              return `${dataset.label}: ${point.value}`;
            },
          },
        },
        legend: {
          display: legend.visible,
          position: legend.position ?? ('bottom' as const),
          align: legend.align ?? ('center' as const),
          labels: {
            boxWidth: 15,
          },
        },
        annotation: {
          annotations: [...benchmarkAnnotations, ...blockAnnotations],
        },
      },
    };
  }, [
    scales,
    data,
    benchmarks,
    blocks,
    timeAxis.granularity,
    legend.align,
    legend.position,
    legend.visible,
    appliedStyles,
  ]);

  const chartJsPlugins = useMemo(() => {
    return [Annotation, ChartjsPluginWatermark];
  }, []);

  const chart = useMemo(() => {
    return (
      <LineChart
        redraw
        height={height ?? (isMobile ? 200 : 240)}
        data={chartJsData}
        options={chartJsOptions}
        plugins={chartJsPlugins}
      />
    );
  }, [height, isMobile, chartJsData, chartJsOptions, chartJsPlugins]);

  return <ChartDiv isMobile={isMobile}>{chart}</ChartDiv>;
};
