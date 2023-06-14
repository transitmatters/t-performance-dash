import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { SideNavBar } from '../../modules/navigation/DesktopSideNavBar';
import { MobileNavHeader } from '../../modules/navigation/MobileNavHeader';

interface NavLayoutProps {
  children: React.ReactNode;
}

export const NavLayout: React.FC<NavLayoutProps> = ({ children }) => {
  const isMobile = !useBreakpoint('md');

  return (
    <div className="flex min-h-full flex-col justify-between bg-tm-lightGrey">
      {isMobile ? <MobileNavHeader /> : <SideNavBar />}
      {children}
    </div>
  );
};
