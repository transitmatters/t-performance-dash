import { CSVLink } from 'react-csv';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { DataPoint } from '../../types/dataPoints';
import type { AggregateDataPoint, Location } from '../../types/charts';
import { lineColorTextHover } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';
import { filename } from '../../utils/csv';

interface DownloadButtonProps {
  datasetName: string;
  data: (DataPoint | AggregateDataPoint)[];
  bothStops: boolean;
  startDate: string;
  location?: Location;
  endDate?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  datasetName,
  data,
  bothStops,
  startDate,
  location,
  endDate,
}) => {
  const { line } = useDelimitatedRoute();
  return (
    <div className={classNames('flex')} title="Download data as CSV">
      <CSVLink
        className={'csv-link'}
        data={data}
        title={'Download data as CSV'}
        filename={filename(datasetName, bothStops, startDate, line, location, endDate)}
      >
        <FontAwesomeIcon
          icon={faFileArrowDown}
          className={classNames('text-stone-600', line && lineColorTextHover[line])}
        />
      </CSVLink>
    </div>
  );
};
