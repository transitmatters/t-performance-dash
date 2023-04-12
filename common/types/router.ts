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

export type QueryParams = {
  startDate?: string;
  endDate?: string;
  queryType?: QueryTypeOptions;
  busRoute?: BusRoute;
  to?: string;
  from?: string;
};

export type QueryTypeOptions = 'single' | 'range';

export type Tab = 'Bus' | 'Subway' | 'System';
