import { useCallback } from 'react';
import type { MouseEvent, RefObject } from 'react';
import type { Chart } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '../../types/charts';
import { useDelimitatedRoute } from '../../utils/router';
import { Button } from '../ui/button';
import { getImageFilename } from '../../utils/csv';
import { downloadChartAsImage } from '../../utils/image';
import { svgToCanvas } from '../../utils/svgImage';
import { resolveChartHeading } from '../../utils/chartTitles';
import type { CardHeading, ChartDatasetName } from '../../utils/chartTitles';

interface SaveChartImageButtonProps {
  /** The Chart.js chart to save. */
  chartRef?: RefObject<Chart | null>;
  /** Or an element holding an SVG chart, such as a line map. */
  svgRef?: RefObject<HTMLElement | null>;
  datasetName: ChartDatasetName;
  startDate: string;
  /** Shown in the image in place of the dates, for a chart of a period such as a season. */
  period?: string;
  includeBothStopsForLocation?: boolean;
  location?: Location;
  endDate?: string;
  /** Overrides the title of the widget card the chart sits in. */
  chartTitle?: string;
  /** Overrides the subtitle of the widget card the chart sits in. */
  chartSubtitle?: string;
}

/** Reads the title and subtitle the enclosing widget card shows on screen. */
const readCardHeading = (element: Element): CardHeading | undefined => {
  const header = element
    .closest('[data-slot="card"]')
    ?.querySelector(':scope > [data-slot="card-header"]');
  if (!header) return undefined;
  const text = (slot: string) =>
    header.querySelector(`[data-slot="${slot}"]`)?.textContent?.trim() || undefined;
  return { title: text('card-title'), subtitle: text('card-description') };
};

export const SaveChartImageButton = ({
  chartRef,
  svgRef,
  datasetName,
  startDate,
  period,
  includeBothStopsForLocation,
  location,
  endDate,
  chartTitle,
  chartSubtitle,
}: SaveChartImageButtonProps) => {
  const { line, colorKey } = useDelimitatedRoute();

  const handleClick = useCallback(
    async (event: MouseEvent<HTMLButtonElement>) => {
      // Read the card before awaiting: React clears currentTarget once the handler yields
      const card = readCardHeading(event.currentTarget);
      const canvas =
        chartRef?.current?.canvas ?? (svgRef?.current ? await svgToCanvas(svgRef.current) : null);
      if (!canvas) return;
      const filename = getImageFilename({
        datasetName,
        includeBothStopsForLocation,
        startDate,
        line,
        location,
        endDate,
      });
      const { title, subtitle } = resolveChartHeading({
        datasetName,
        chartTitle,
        chartSubtitle,
        card,
      });
      downloadChartAsImage(
        canvas,
        {
          title,
          subtitle,
          startDate,
          endDate,
          period,
          location,
          line: colorKey,
          includeBothStopsForLocation,
        },
        filename
      );
    },
    [
      chartRef,
      svgRef,
      period,
      datasetName,
      includeBothStopsForLocation,
      startDate,
      line,
      colorKey,
      location,
      endDate,
      chartTitle,
      chartSubtitle,
    ]
  );

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} aria-label="Save chart as an image">
      <FontAwesomeIcon icon={faFileImage} aria-hidden />
      PNG
    </Button>
  );
};
