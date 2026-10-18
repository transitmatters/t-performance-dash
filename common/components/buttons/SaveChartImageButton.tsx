import React, { useCallback } from 'react';
import type { Chart } from 'chart.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileImage } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { Location } from '../../types/charts';
import { lineColorTextHover } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';
import { getImageFilename } from '../../utils/csv';
import { downloadChartAsImage } from '../../utils/image';

interface SaveChartImageButtonProps {
  chartRef: React.MutableRefObject<Chart | undefined>;
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
    <div className={classNames('flex')} title="Save chart as image">
      <button onClick={handleClick} className="cursor-pointer">
        <FontAwesomeIcon
          icon={faFileImage}
          className={classNames('text-stone-600', line && lineColorTextHover[line])}
        />
      </button>
    </div>
  );
};
