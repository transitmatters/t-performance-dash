import type { SelectOption } from '../../common/types/inputs';
import type { LineShort } from '../../common/types/lines';
import type { Station } from '../../common/types/stations';
import type { Location } from '../types/charts';
import type { Direction } from '../types/dataPoints';
import { stations, rtStations, busStations } from './../constants/stations';

export const optionsForField = (
  type: 'from' | 'to',
  line: LineShort,
  fromStation: Station | null,
  toStation: Station | null,
  busRoute?: string
) => {
  if (type === 'from') {
    return optionsStation(line, busRoute);
  }
  if (type === 'to') {
    return optionsStation(line, busRoute)?.filter((entry) => {
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

const createStationIndex = () => {
  const index: Record<string, Station> = {};
  Object.values({ ...rtStations, ...busStations }).forEach((line) => {
    line.stations.forEach((station) => {
      index[station.station] = station;
    });
  });
  return index;
};

const createParentStationIndex = () => {
  const index: Record<string, Station> = {};
  Object.values({ ...rtStations, ...busStations }).forEach((line) => {
    line.stations.forEach((station) => {
      const allStopIds = [...(station.stops['0'] || []), ...(station.stops['1'] || [])];
      allStopIds.forEach((stopId) => {
        index[stopId] = station;
      });
    });
  });
  return index;
};

const stationIndex = createStationIndex();
const parentStationIndex = createParentStationIndex();

export const getStationById = (stationStopId: string) => {
  return stationIndex[stationStopId];
};

export const getParentStationForStopId = (stopId: string) => {
  return parentStationIndex[stopId];
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

export const getLocationDetails = (
  from: Station | undefined,
  to: Station | undefined
): Location => {
  if (to === undefined || from === undefined) {
    return {
      to: to?.stop_name || 'Loading...',
      from: from?.stop_name || 'Loading...',
      direction: 'southbound',
    };
  }

  return {
    to: to.stop_name,
    from: from.stop_name,
    direction: travelDirection(from, to),
  };
};
