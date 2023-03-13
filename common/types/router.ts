import type { DataPage } from './dataPages';
import type { Line, LinePath, LineShort } from './lines';

export interface Route {
  line: Line | undefined;
  linePath: LinePath;
  lineShort: LineShort;
  datapage: DataPage;
  query: QueryParams;
  tab: Tabs;
}

export interface QueryParams {
  line?: Line;
  startDate?: string;
  endDate?: string;
  busLine?: string;
}

export type Tabs = 'Bus' | 'Subway' | '';
