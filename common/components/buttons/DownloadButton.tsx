import { CSVLink } from 'react-csv';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import type { Location } from '../../types/charts';
import { useDelimitatedRoute } from '../../utils/router';
import { getCsvFilename } from '../../utils/csv';
import { buttonVariants } from '../ui/button';

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
  const { t } = useTranslation();
  const { line } = useDelimitatedRoute();
  return (
    <CSVLink
      className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'csv-link' })}
      data={data}
      aria-label={t('buttons.downloadCsv')}
      filename={getCsvFilename({
        datasetName,
        includeBothStopsForLocation,
        startDate,
        line,
        location,
        endDate,
      })}
    >
      <FontAwesomeIcon icon={faFileArrowDown} aria-hidden />
      CSV
    </CSVLink>
  );
};
