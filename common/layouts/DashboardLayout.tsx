import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/WidgetPage';
import { MobileHeader } from '../../modules/dashboard/MobileHeader';
import { DesktopHeader } from '../../modules/dashboard/DesktopHeader';
import { useDelimitatedRoute } from '../utils/router';
import { ALL_PAGES } from '../constants/pages';
import { MobileControlPanel } from '../components/controls/MobileControlPanel';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = !useBreakpoint('md');
  const { line, page, query, tab } = useDelimitatedRoute();
  const { busRoute, crRoute } = query;
  const dateStoreSection = page ? ALL_PAGES[page]?.dateStoreSection : undefined;
  const showControlParams =
    dateStoreSection && (line || tab === 'System') && dateStoreSection !== 'today';

  return (
    <div className="flex flex-1 flex-col pb-24 md:pb-0 md:pl-64">
      <main className="flex-1">
        {isMobile ? <MobileHeader /> : <DesktopHeader />}
        <div className="py-2 md:py-4">
          <div className="h-full px-2 sm:px-4 md:px-6">
            <WidgetPage>{children}</WidgetPage>
          </div>
        </div>
      </main>
      {isMobile && showControlParams && (
        <MobileControlPanel dateStoreSection={dateStoreSection} line={line} busRoute={busRoute} />
      )}
    </div>
  );
};
