import { DashboardLayout } from '../layouts/DashboardLayout';
import { MetricsLayout } from '../layouts/MetricsLayout';
import { TripExplorerLayout } from '../layouts/TripExplorerLayout';
import type { LayoutNames } from '../layouts/layoutTypes';
export const Layouts: { [key in LayoutNames]: ({ children }) => JSX.Element } = {
  Dashboards: DashboardLayout,
  Metrics: MetricsLayout,
  Trips: TripExplorerLayout,
};
export type LayoutKeys = keyof typeof Layouts;
