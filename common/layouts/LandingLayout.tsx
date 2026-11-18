import type { ReactNode } from 'react';
import { CIPBanner } from '../components/CIPBanner';
import { SiteFooter } from '../../modules/navigation/SiteFooter';

interface LandingLayoutProps {
  children: ReactNode;
}

export const LandingLayout = ({ children }: LandingLayoutProps) => {
  return (
    <div className="flex flex-1 flex-col">
      <CIPBanner />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
};
