import type { OverviewDatePresetKey } from '../constants/dates';
import type { Page } from '../constants/pages';
import type { BusRoute, Line, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  page: Page;
  query: QueryParams;
  tab: Tab;
}

export const DATE_PARAMS = ['startDate', 'endDate', 'date'];
export const STATION_PARAMS = ['from', 'to'];

export type QueryParams = {
  startDate?: string;
  endDate?: string;
  date?: string;
  busRoute?: BusRoute;
  view?: OverviewDatePresetKey;
  to?: string;
  from?: string;
};

export type QueryTypeOptions = 'single' | 'range';

export type Tab = 'Bus' | 'Subway' | 'System';

export const DATE_PARAMS = ['startDate', 'endDate', 'date', 'queryType']; // TODO: Remove queryType from this array when stationConfig changes added.
