import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/Widget';
import { DesktopHeader } from '../../modules/dashboard/DesktopHeader';
import { SideNavBar } from '../../modules/navigation/SideNavBar';
import { MobileHeader } from '../../modules/dashboard/MobileHeader';
import { useDelimitatedRoute } from '../utils/router';
import { ALL_PAGES } from '../constants/pages';
import { usePresetsOnFirstLoad } from '../utils/firstLoad';
import { MobileControlPanel } from '../components/controls/MobileControlPanel';
import { Footer } from './Footer';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = !useBreakpoint('md');
  const { line, page, query } = useDelimitatedRoute();
  const { busRoute, queryType } = query;
  const section = page ? ALL_PAGES[page]?.section : undefined;
  const showControlParams = section && line && section !== 'today';
  usePresetsOnFirstLoad(section, query);

  return (
    <div className="flex min-h-full flex-col justify-between">
      <SideNavBar />

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
          <MobileControlPanel
            section={section}
            line={line}
            queryType={queryType}
            busRoute={busRoute}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};
