import { CSVLink } from 'react-csv';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { Location } from '../../types/charts';
import { lineColorTextHover } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';
import { getCsvFilename } from '../../utils/csv';

interface DownloadButtonProps {
  datasetName: string;
  data: Record<string, any>[];
  startDate: string;
  includeBothStopsForLocation?: boolean;
  location?: Location;
  endDate?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  datasetName,
  data,
  includeBothStopsForLocation,
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
        filename={getCsvFilename({
          datasetName,
          includeBothStopsForLocation,
          startDate,
          line,
          location,
          endDate,
        })}
      >
        <FontAwesomeIcon
          icon={faFileArrowDown}
          className={classNames('text-stone-600', line && lineColorTextHover[line])}
        />
      </CSVLink>
    </div>
  );
};
