import type { SelectOption } from '../../common/types/inputs';
import type { LineShort } from '../../common/types/lines';
import type { Station } from '../../common/types/stations';
import type { Location } from '../types/charts';
import type { Direction } from '../types/dataPoints';
import { stations } from './../constants/stations';

export const optionsForField = (
  type: 'from' | 'to',
  line: LineShort,
  fromStation: Station | null,
  toStation: Station | null,
  busRoute?: string
) => {
  if (type === 'from') {
    return optionsStation(line, busRoute)?.filter((entry) => entry !== toStation);
  }
  if (type === 'to') {
    return optionsStation(line, busRoute)?.filter((entry) => {
      if (entry === fromStation) {
        return false;
      }
      if (fromStation && fromStation.branches && entry.branches) {
        return entry.branches.some((entryBranch) => fromStation.branches?.includes(entryBranch));
      }
      return true;
    });
  }
};

export const optionsStation = (line: LineShort, busRoute?: string): Station[] | undefined => {
  if (!line || !stations[line]) {
    return undefined;
  }

  if (line === 'Bus') {
    if (!busRoute || !stations[line][busRoute]) {
      return undefined;
    }

    return stations[line][busRoute].stations.sort((a, b) => a.order - b.order);
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

export const lookup_station_by_id = (line: LineShort, id: string, busRoute?: string) => {
  if (line === undefined || id === '' || id === undefined) {
    return undefined;
  }

  return optionsStation(line, busRoute)?.find((x) =>
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
