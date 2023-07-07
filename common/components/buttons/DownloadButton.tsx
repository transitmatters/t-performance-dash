import { CSVLink } from 'react-csv';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileArrowDown } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import type { DataPoint } from '../../types/dataPoints';
import type { AggregateDataPoint, Location } from '../../types/charts';
import { lineColorTextHover } from '../../styles/general';
import { useDelimitatedRoute } from '../../utils/router';

const directionAbbrs = {
  northbound: 'NB',
  southbound: 'SB',
  eastbound: 'EB',
  westbound: 'WB',
  inbound: 'IB',
  outbound: 'OB',
};

function filename(
  datasetName: string,
  location: Location,
  bothStops: boolean,
  startDate: string,
  endDate?: string
) {
  // CharlesMGH-SB_dwells_20210315.csv
  // CentralSquareCambridge-MelneaCassWashington_traveltimesByHour-weekday_20200101-20201231.csv
  // BostonUniversityWest-EB_headways_20161226-20170328.csv
  const fromStop = location.from.replace(/[^A-z]/g, '');
  const toStop = location.to.replace(/[^A-z]/g, '');
  const dir = directionAbbrs[location.direction];
  const where = `${fromStop}-${bothStops ? toStop : dir}`;

  const what = datasetName;

  const date1 = startDate.replaceAll('-', '');
  const date2 = endDate ? `-${endDate.replaceAll('-', '')}` : '';
  const when = `${date1}${date2}`;

  return `${where}_${what}_${when}.csv`;
}

interface DownloadButtonProps {
  datasetName: string;
  data: (DataPoint | AggregateDataPoint)[];
  location: Location;
  bothStops: boolean;
  startDate: string;
  endDate?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  datasetName,
  data,
  location,
  bothStops,
  startDate,
  endDate,
}) => {
  const { line } = useDelimitatedRoute();
  return (
    <div
      className={classNames('flex', line && lineColorTextHover[line])}
      title="Download data as CSV"
    >
      <CSVLink
        className={'csv-link'}
        data={data}
        title={'Download data as CSV'}
        filename={filename(datasetName, location, bothStops, startDate, endDate)}
      >
        <FontAwesomeIcon icon={faFileArrowDown} className="text-stone-600" />
      </CSVLink>
    </div>
  );
};
