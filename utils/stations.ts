import { SelectOption } from '../types/inputs';
import { Line, Station } from '../types/stations';
import { stations } from './constants';

export const optionsForField = (
  type: 'from' | 'to',
  line: Line,
  fromStation: Station | null,
  toStation: Station | null
) => {
  if (type === 'from') {
    return options_station_ui(line).filter((entry) => entry.value !== toStation);
  }
  if (type === 'to') {
    return options_station_ui(line).filter(({ value }) => {
      if (value === fromStation) {
        return false;
      }
      if (fromStation && fromStation.branches && value.branches) {
        return value.branches.some((entryBranch) => fromStation.branches?.includes(entryBranch));
      }
      return true;
    });
  } else {
    // This will never be reached thanks to TS
    return [];
  }
};

const options_station_ui = (line: Line): SelectOption<Station>[] => {
  return options_station(line)
    .map((station) => {
      return {
        id: station.station,
        value: station,
        disabled: station.disabled,
        label: station.stop_name,
      };
    })
    .sort((a, b) => a.value.order - b.value.order);
};

const options_station = (line: Line) => {
  if (!line) {
    return [];
  }
  return stations[line].stations;
};

export const swapStations = (
  fromStation: SelectOption<Station> | null,
  toStation: SelectOption<Station> | null,
  setFromStation: (fromStation: SelectOption<Station> | null) => void,
  setToStation: (toStation: SelectOption<Station> | null) => void
) => {
  setFromStation(toStation);
  setToStation(fromStation);
};

export const lookup_station_by_id = (line: string, id: string) => {
  if (line === '' || line === undefined || id === '' || id === undefined) {
    return undefined;
  }

  return stations[line].stations.find((x) =>
    [...(x.stops['0'] || []), ...(x.stops['1'] || [])].includes(id)
  );
};
