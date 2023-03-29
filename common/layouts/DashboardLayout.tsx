import React from 'react';
import { BottomNavBar } from '../../modules/navigation/mobile/BottomNavBar';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { DataPageHeader } from '../../modules/dashboard/DataPageHeader';
import { WidgetPage } from '../components/widgets/Widget';
import { SideNavBar } from '../../modules/navigation/desktop/SideNavBar';
import { Footer } from './Footer';

export const DashboardLayout = ({ children }) => {
  const isMobile = !useBreakpoint('md');

  return (
    <div className="flex min-h-full flex-col justify-between">
      <SideNavBar />
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-2 md:py-6">
            <div className="h-full px-4 sm:px-6 md:px-8">
              <WidgetPage>
                <DataPageHeader />
                {children}
              </WidgetPage>
            </div>
          </div>
        </main>
        {isMobile && (
          <>
            <BottomNavBar />
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};
