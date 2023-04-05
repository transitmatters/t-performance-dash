import { DashboardLayout } from '../layouts/DashboardLayout';
import { EmptyLayout } from '../layouts/EmptyLayout';
import { MetricsLayout } from '../layouts/MetricsLayout';
import { OverviewLayout } from '../layouts/OverviewLayout';
import { TripExplorerLayout } from '../layouts/TripExplorerLayout';
import type { LayoutNames } from '../layouts/layoutTypes';
export const Layouts: { [key in LayoutNames]: ({ children }) => JSX.Element } = {
  Dashboards: DashboardLayout,
  Overview: OverviewLayout,
  Metrics: MetricsLayout,
  Trips: TripExplorerLayout,
  Empty: EmptyLayout,
};
export type LayoutKeys = keyof typeof Layouts;
