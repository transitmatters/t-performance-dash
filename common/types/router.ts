import type { DataPage } from './dataPages';
import type { BusRoute, Line, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  datapage: DataPage;
  query: QueryParams;
  tab: Tabs;
}

export interface QueryParams {
  startDate?: string;
  endDate?: string;
  busRoute?: BusRoute;
  to?: string;
  from?: string;
}

export type Tabs = 'Bus' | 'Subway' | '';
