import React, { useCallback } from 'react';
import type { Chart } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import type { Location } from '../../types/charts';
import { useDelimitatedRoute } from '../../utils/router';
import { Button } from '../ui/button';
import { getImageFilename } from '../../utils/csv';
import { downloadChartAsImage } from '../../utils/image';

interface SaveChartImageButtonProps {
  chartRef: React.RefObject<Chart | null>;
  datasetName: string;
  startDate: string;
  includeBothStopsForLocation?: boolean;
  location?: Location;
  endDate?: string;
  chartTitle?: string;
}

export const SaveChartImageButton: React.FC<SaveChartImageButtonProps> = ({
  chartRef,
  datasetName,
  startDate,
  includeBothStopsForLocation,
  location,
  endDate,
  chartTitle,
}) => {
  const { line } = useDelimitatedRoute();

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
      { datasetName, startDate, endDate, location, line, includeBothStopsForLocation, chartTitle },
      filename
    );
  }, [
    chartRef,
    datasetName,
    includeBothStopsForLocation,
    startDate,
    line,
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
