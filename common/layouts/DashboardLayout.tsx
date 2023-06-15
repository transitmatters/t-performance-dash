import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/Widget';
import { SideNavBar } from '../../modules/navigation/DesktopSideNavBar';
import { MobileHeader } from '../../modules/dashboard/MobileHeader';
import { DesktopHeader } from '../../modules/dashboard/DesktopHeader';
import { useDelimitatedRoute } from '../utils/router';
import { ALL_PAGES } from '../constants/pages';
import { usePresetsOnFirstLoad } from '../utils/firstLoad';
import { MobileControlPanel } from '../components/controls/MobileControlPanel';
import { MobileNavHeader } from '../../modules/navigation/MobileNavHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = !useBreakpoint('md');
  const { line, page, query, tab } = useDelimitatedRoute();
  const { busRoute } = query;
  const dateStoreSection = page ? ALL_PAGES[page]?.dateStoreSection : undefined;
  const showControlParams =
    dateStoreSection && (line || tab === 'System') && dateStoreSection !== 'today';
  usePresetsOnFirstLoad(dateStoreSection, query);

  return (
    <div className="flex min-h-full flex-col justify-between bg-stone-100">
      {isMobile ? <MobileNavHeader /> : <SideNavBar />}

      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          {isMobile ? <MobileHeader /> : <DesktopHeader />}
          <div className="py-2 md:py-6">
            <div className="h-full px-4 sm:px-6 md:px-8">
              <WidgetPage>{children}</WidgetPage>
            </div>
          </div>
        </main>
        {isMobile && showControlParams && (
          <MobileControlPanel dateStoreSection={dateStoreSection} line={line} busRoute={busRoute} />
        )}
      </div>
    </div>
  );
};
