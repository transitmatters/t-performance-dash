import type { ReactNode } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { LandingLayout } from './LandingLayout';
import type { LayoutNames } from './layoutTypes';

export const Layouts: Record<LayoutNames, ({ children }: { children: ReactNode }) => ReactNode> = {
  Landing: LandingLayout as ({ children }: { children: ReactNode }) => ReactNode,
  Dashboard: DashboardLayout as ({ children }: { children: ReactNode }) => ReactNode,
};
