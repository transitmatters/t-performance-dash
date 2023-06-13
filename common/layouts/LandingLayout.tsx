import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { SideNavBar } from '../../modules/navigation/DesktopSideNavBar';
import { MobileNavHeader } from '../../modules/navigation/MobileNavHeader';
import { Footer } from './Footer';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const isMobile = !useBreakpoint('md');

  return (
    <div className="flex min-h-full flex-col justify-between bg-tm-lightGrey">
      {isMobile ? <MobileNavHeader /> : <SideNavBar />}

      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">{children}</main>
      </div>
      <Footer />
    </div>
  );
};
