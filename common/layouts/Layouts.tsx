import { DashboardLayout } from '../layouts/DashboardLayout';
import { LandingLayout } from '../layouts/LandingLayout';
import type { LayoutNames } from './layoutTypes';
export const Layouts: { [key in LayoutNames]: ({ children }) => JSX.Element | null } = {
  Landing: LandingLayout,
  Dashboard: DashboardLayout,
};
