import { useCallback } from 'react';
import type { RefObject } from 'react';
import type { Chart } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '../../types/charts';
import { useDelimitatedRoute } from '../../utils/router';
import { useChartBusRoute } from '../../hooks/useChartBusRoute';
import { Button } from '../ui/button';
import { getImageFilename } from '../../utils/csv';
import { downloadChartAsImage } from '../../utils/image';

interface SaveChartImageButtonProps {
  chartRef: RefObject<Chart | null>;
  datasetName: string;
  startDate: string;
  includeBothStopsForLocation?: boolean;
  location?: Location;
  endDate?: string;
  chartTitle?: string;
}

export const SaveChartImageButton = ({
  chartRef,
  datasetName,
  startDate,
  includeBothStopsForLocation,
  location,
  endDate,
  chartTitle,
}: SaveChartImageButtonProps) => {
  const { line } = useDelimitatedRoute();
  const busRoute = useChartBusRoute();

  const handleClick = useCallback(() => {
    if (!chartRef.current) return;
    const filename = getImageFilename({
      datasetName,
      includeBothStopsForLocation,
      startDate,
      line,
      location,
      endDate,
    });
    downloadChartAsImage(
      chartRef.current,
      {
        datasetName,
        startDate,
        endDate,
        location,
        line,
        busRoute,
        includeBothStopsForLocation,
        chartTitle,
      },
      filename
    );
  }, [
    chartRef,
    datasetName,
    includeBothStopsForLocation,
    startDate,
    line,
    busRoute,
    location,
    endDate,
    chartTitle,
  ]);

  return (
    <Button variant="ghost" size="sm" onClick={handleClick} aria-label="Save chart as an image">
      <FontAwesomeIcon icon={faFileImage} aria-hidden />
      PNG
    </Button>
  );
};
