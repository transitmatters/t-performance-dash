import type { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { LandingLayout } from './LandingLayout';
import type { Layout } from './layoutTypes';

export const Layouts: {
  [key in Layout]: ({ children }: { children: ReactNode }) => ReactNode;
} = {
  Landing: LandingLayout,
  Dashboard: DashboardLayout,
};
