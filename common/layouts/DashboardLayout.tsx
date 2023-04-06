import React from 'react';
import { SideNavBar } from '../../modules/navigation/desktop/SideNavBar';
import { BottomNavBar } from '../../modules/navigation/mobile/BottomNavBar';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/Widget';
import { DataPageHeader } from '../../modules/dashboard/DataPageHeader';
import { useDelimitatedRoute } from '../utils/router';
import { ALL_PAGES } from '../constants/pages';
import { DateSelection } from '../components/inputs/DateSelection/DateSelection';
import { OverviewDateSelection } from '../components/inputs/DateSelection/OverviewDateSelection';
import { Footer } from './Footer';

export const DashboardLayout = ({ children }) => {
  const isMobile = !useBreakpoint('md');
  const { page } = useDelimitatedRoute();

  const section = ALL_PAGES[page]?.section;
  const getDatePicker = () => {
    if (section === 'range' || section === 'line') return <DateSelection range />;
    if (section === 'overview') return <OverviewDateSelection />;
    if (section === 'single') return <DateSelection range={false} />;
  };

  return (
    <div className="flex min-h-full flex-col justify-between">
      <SideNavBar />
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-2 md:py-6">
            <div className="h-full px-4 sm:px-6 md:px-8">
              {!isMobile && <div className="w-sm fixed right-4 top-4 z-10">{getDatePicker()}</div>}
              <WidgetPage>
                <DataPageHeader />

                {children}
              </WidgetPage>
            </div>
          </div>
        </main>
        {isMobile && <BottomNavBar />}
      </div>
      <Footer />
    </div>
  );
};
