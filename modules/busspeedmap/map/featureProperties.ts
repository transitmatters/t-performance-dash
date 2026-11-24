import type {
  BusDwellProperties,
  BusSpeedSegmentProperties,
  BusStopProperties,
  StationProperties,
} from '../types';

/**
 * Tile features come back with untyped properties. Each guard checks the fields the map keys and
 * filters on, which the layers' expressions already rely on being these types.
 */
type Properties = Record<string, unknown>;

const isProperties = (value: unknown): value is Properties =>
  typeof value === 'object' && value !== null;

const hasStrings = (properties: Properties, keys: string[]) =>
  keys.every((key) => typeof properties[key] === 'string');

const hasNumbers = (properties: Properties, keys: string[]) =>
  keys.every((key) => typeof properties[key] === 'number');

export const isSegmentProperties = (value: unknown): value is BusSpeedSegmentProperties =>
  isProperties(value) &&
  hasStrings(value, ['route_id', 'from_stop_name', 'to_stop_name']) &&
  hasNumbers(value, ['direction_id', 'n_traversals']);

export const isDwellProperties = (value: unknown): value is BusDwellProperties =>
  isProperties(value) &&
  hasStrings(value, ['route_id', 'stop_id', 'stop_name']) &&
  hasNumbers(value, ['direction_id', 'n_dwells', 'median_dwell_seconds']);

export const isBusStopProperties = (value: unknown): value is BusStopProperties =>
  isProperties(value) && hasStrings(value, ['stop_id', 'stop_name', 'routes']);

export const isStationProperties = (value: unknown): value is StationProperties =>
  isProperties(value) && hasStrings(value, ['stop_id', 'stop_name', 'lines', 'routes']);
