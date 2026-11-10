import { useCallback } from 'react';
import type { MouseEvent, RefObject } from 'react';
import type { Chart } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '../../types/charts';
import { useDelimitatedRoute } from '../../utils/router';
import { useChartBusRoute } from '../../hooks/useChartBusRoute';
import { Button } from '../ui/button';
import { getImageFilename } from '../../utils/csv';
import { downloadChartAsImage } from '../../utils/image';
import { resolveChartHeading } from '../../utils/chartTitles';
import type { CardHeading, ChartDatasetName } from '../../utils/chartTitles';

interface SaveChartImageButtonProps {
  chartRef: RefObject<Chart | null>;
  datasetName: ChartDatasetName;
  startDate: string;
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
  datasetName,
  startDate,
  includeBothStopsForLocation,
  location,
  endDate,
  chartTitle,
  chartSubtitle,
}: SaveChartImageButtonProps) => {
  const { line } = useDelimitatedRoute();
  const busRoute = useChartBusRoute();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (!chartRef.current) return;
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
        card: readCardHeading(event.currentTarget),
      });
      downloadChartAsImage(
        chartRef.current,
        {
          title,
          subtitle,
          startDate,
          endDate,
          location,
          line,
          busRoute,
          includeBothStopsForLocation,
        },
        filename
      );
    },
    [
      chartRef,
      datasetName,
      includeBothStopsForLocation,
      startDate,
      line,
      busRoute,
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
