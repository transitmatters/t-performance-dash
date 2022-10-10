import { CSVLink } from 'react-csv';
import { AggregatePoint, DataPoint, Location } from './types';

const directionAbbrs = {
  northbound: "NB",
  southbound: "SB",
  eastbound: "EB",
  westbound: "WB",
  inbound: "IB",
  outbound: "OB"
};

function filename(datasetName: string, location: Location, bothStops: boolean, startDate: string, endDate: string) {
  // CharlesMGH-SB_dwells_20210315.csv
  // CentralSquareCambridge-MelneaCassWashington_traveltimesByHour-weekday_20200101-20201231.csv
  // BostonUniversityWest-EB_headways_20161226-20170328.csv
  const fromStop = location.from.replace(/[^A-z]/g, "");
  const toStop = location.to.replace(/[^A-z]/g, "");
  const dir = directionAbbrs[location.direction];
  const where = `${fromStop}-${bothStops ? toStop : dir}`;

  const what = datasetName;

  const date1 = startDate.replaceAll("-", "");
  const date2 = endDate ? `-${endDate.replaceAll("-", "")}` : "";
  const when = `${date1}${date2}`;

  return `${where}_${what}_${when}.csv`;
}

interface DownloadButtonProps {
  datasetName: string;
  data: (DataPoint | AggregatePoint)[];
  location: Location;
  bothStops: boolean;
  startDate: string;
  endDate: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  datasetName,
  data,
  location,
  bothStops,
  startDate,
  endDate
}) => {
  console.log(data)
  return(
    <div className="download-button" title="Download data as CSV">
      <CSVLink
        className="csv-link"
        data={data}
        filename={filename(datasetName, location, bothStops, startDate, endDate)}
        >
      </CSVLink>
    </div>
  );
}
