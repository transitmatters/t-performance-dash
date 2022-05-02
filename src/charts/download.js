import React from 'react';
import { CSVLink } from 'react-csv';

function filename(seriesName, location, bothStops, date) {
  // CharlesMGH-southbound_dwelltimes_20210315.csv
  // CentralSquareCambridge-MelneaCassWashington_traveltimes_20201119.csv
  // BostonUniversityWest-eastbound_headways_20161226.csv
  const fromStop = location.from.replace(/[^A-z]/g, "");
  const toStop = location.to.replace(/[^A-z]/g, "");

  const series = `${seriesName.replace(" ", "")}s`;

  const dateString = date.replaceAll("-", "");

  const components = `${fromStop}-${bothStops ? toStop : location.direction}_${series}_${dateString}`;
  
  return `${components}.csv`;
}

const DownloadButton = (props) => {
  /**
  * props:
  *  - data
  *  - seriesName
  *  - location
  *  - bothStops
  *  - date
  */
  return(
    <div className="download-button" title="Download Data as CSV">
      <CSVLink
        className="csv-link"
        data={props.data}
        filename={filename(props.seriesName, props.location, props.bothStops, props.date)}
        >
      </CSVLink>
    </div>
  );
}
  
export { DownloadButton }
