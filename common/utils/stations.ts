import type { SelectOption } from '../../common/types/inputs';
import type { LineShort } from '../../common/types/lines';
import type { Station } from '../../common/types/stations';
import type { Location } from '../types/charts';
import type { Direction } from '../types/dataPoints';
import { rtStations, stations } from './../constants/stations';

export const optionsForField = (
  type: 'from' | 'to',
  line: LineShort,
  fromStation: Station | null,
  toStation: Station | null
) => {
  if (type === 'from') {
    return options_station_ui(line)?.filter((entry) => entry.value !== toStation);
  }
  if (type === 'to') {
    return options_station_ui(line)?.filter(({ value }) => {
      if (value === fromStation) {
        return false;
      }
      if (fromStation && fromStation.branches && value.branches) {
        return value.branches.some((entryBranch) => fromStation.branches?.includes(entryBranch));
      }
      return true;
    });
  }
};

const options_station_ui = (line: LineShort): SelectOption<Station>[] | undefined => {
  return optionsStation(line)
    ?.map((station) => {
      return {
        id: station.station,
        value: station,
        disabled: station.disabled,
        label: station.stop_name,
      };
    })
    .sort((a, b) => a.value.order - b.value.order);
};

export const optionsStation = (line: LineShort, busLine?: string): Station[] | undefined => {
  if (!line || !stations[line]) {
    return undefined;
  }

  if (line === 'Bus') {
    if (!busLine || !stations[line][busLine]) {
      return undefined;
    }

    return stations[line][busLine].stations.sort((a, b) => a.order - b.order);
  }

  return stations[line].stations.sort((a, b) => a.order - b.order);
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

export const lookup_station_by_id = (line: Exclude<LineShort, 'Bus'>, id: string) => {
  if (line === undefined || id === '' || id === undefined) {
    return undefined;
  }

  return rtStations[line].stations.find((x) =>
    [...(x.stops['0'] || []), ...(x.stops['1'] || [])].includes(id)
  );
};

export const stopIdsForStations = (
  from: Station | undefined,
  to: Station | undefined
): { fromStopIds: string[] | undefined; toStopIds: string[] | undefined } => {
  if (to === undefined || from === undefined) {
    return { fromStopIds: undefined, toStopIds: undefined };
  }

  const isDirection1 = from.order < to.order;
  return {
    fromStopIds: isDirection1 ? from.stops['1'] : from.stops['0'],
    toStopIds: isDirection1 ? to.stops['1'] : to.stops['0'],
  };
};

export const travelDirection = (from: Station, to: Station): Direction => {
  return from.order < to.order ? 'southbound' : 'northbound';
};

export const locationDetails = (
  from: Station | undefined,
  to: Station | undefined,
  lineShort: LineShort
): Location => {
  if (to === undefined || from === undefined) {
    return {
      to: to?.stop_name || 'Loading...',
      from: from?.stop_name || 'Loading...',
      direction: 'southbound',
      line: lineShort,
    };
  }

  return {
    to: to.stop_name,
    from: from.stop_name,
    direction: travelDirection(from, to),
    line: lineShort,
  };
};
