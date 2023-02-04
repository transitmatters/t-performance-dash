import React from 'react';
import { SecondaryNavBar } from './general/SecondaryNavBar';
import { SideNavBar } from './SideNavBar';
import { useBreakpoint } from './utils/ScreenSize';
import { DataPageHeader } from './widgets/DataPageHeader';
import { WidgetPage } from './widgets/Widget';

export const DashboardLayoutDesktop = ({ children }) => {
  const isMobile = !useBreakpoint('sm');

  return (
    <div>
      <SideNavBar />
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              <WidgetPage>
                <DataPageHeader />
                {children}
              </WidgetPage>
              {isMobile && <SecondaryNavBar />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
