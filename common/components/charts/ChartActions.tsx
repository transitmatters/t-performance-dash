import type { ComponentProps, ReactNode, RefObject } from 'react';
import type { Chart } from 'chart.js';
import classNames from 'classnames';
import type { Location } from '../../types/charts';
import type { ChartDatasetName } from '../../utils/chartTitles';
import { useIsEmbed } from '../../utils/router';
import { CopyLinkButton } from '../buttons/CopyLinkButton';
import { DownloadButton } from '../buttons/DownloadButton';
import { SaveChartImageButton } from '../buttons/SaveChartImageButton';

interface ChartActionsProps {
  /** Names the PNG and CSV files, and titles a PNG saved from outside a card. */
  datasetName: ChartDatasetName;
  /** The Chart.js chart to save as a PNG. */
  chartRef?: RefObject<Chart | null>;
  /** Or the element holding an SVG chart, such as a line map, to save instead. With neither, there's no PNG. */
  svgRef?: RefObject<HTMLElement | null>;
  /** The rows behind the chart, offered as a CSV. */
  csv?: ComponentProps<typeof DownloadButton>['data'];
  /** Names the CSV file instead of `datasetName`, when its rows cover more than this chart. */
  csvName?: string;
  /** The chart's embed button, from its page's module. */
  embed?: ReactNode;
  /** Dates the files cover. Without a start date or period there's nothing to name them by, so only the link and embed show. */
  startDate?: string;
  endDate?: string;
  /** For a chart of a period rather than a date range, such as a season: shown in the PNG and used in file names. */
  period?: string;
  location?: Location;
  includeBothStopsForLocation?: boolean;
  /** Overrides the card's title in the PNG. */
  chartTitle?: string;
  /** Overrides the card's subtitle in the PNG. */
  chartSubtitle?: string;
  className?: string;
}

/**
 * The row of buttons under a chart: copy link, PNG, CSV and embed. Every chart card uses it, so
 * each offers the same set in the same order. Embeds leave it out, since the host page frames the
 * chart.
 */
export const ChartActions = ({
  datasetName,
  chartRef,
  svgRef,
  csv,
  csvName,
  embed,
  startDate,
  endDate,
  period,
  location,
  includeBothStopsForLocation = false,
  chartTitle,
  chartSubtitle,
  className,
}: ChartActionsProps) => {
  const isEmbed = useIsEmbed();
  if (isEmbed) return null;
  const fileDate = startDate ?? (period && period.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  return (
    // The negative margin lines the last label up with the card's edge rather than its padding
    <div
      className={classNames(
        '-mr-2.5 flex flex-row flex-wrap items-center justify-end gap-x-0.5',
        className
      )}
    >
      <CopyLinkButton />
      {fileDate && (chartRef || svgRef) && (
        <SaveChartImageButton
          chartRef={chartRef}
          svgRef={svgRef}
          datasetName={datasetName}
          location={location}
          includeBothStopsForLocation={includeBothStopsForLocation}
          startDate={fileDate}
          endDate={endDate}
          period={period}
          chartTitle={chartTitle}
          chartSubtitle={chartSubtitle}
        />
      )}
      {fileDate && csv && (
        <DownloadButton
          data={csv}
          datasetName={csvName ?? datasetName}
          location={location}
          includeBothStopsForLocation={includeBothStopsForLocation}
          startDate={fileDate}
          endDate={endDate}
        />
      )}
      {embed}
    </div>
  );
};
