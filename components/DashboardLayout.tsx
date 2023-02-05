import React from 'react';
import { BottomNavBar } from './navigation/BottomNavBar';
import { SecondaryNavBar } from './navigation/SecondaryNavBar';
import { SideNavBar } from './navigation/SideNavBar';
import { useBreakpoint } from './utils/ScreenSize';
import { DataPageHeader } from './widgets/DataPageHeader';
import { WidgetPage } from './widgets/Widget';

export const DashboardLayout = ({ children }) => {
  const isMobile = !useBreakpoint('sm');

  return (
    <div>
      <SideNavBar />
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-2 md:py-6">
            <div className="px-4 sm:px-6 md:px-8">
              <WidgetPage>
                <DataPageHeader />
                {children}
              </WidgetPage>
            </div>
          </div>
        </main>
        {isMobile && (
          <>
            <SecondaryNavBar />
            <BottomNavBar />
          </>
        )}
      </div>
    </div>
  );
};
