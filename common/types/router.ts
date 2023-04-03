import type { Page } from '../constants/datapages';
import type { BusRoute, Line, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  datapage: Page;
  query: QueryParams;
  tab: Tab;
}

export interface QueryParams {
  startDate?: string;
  endDate?: string;
  busRoute?: BusRoute;
}

export type Tab = 'Bus' | 'Subway' | 'System';
