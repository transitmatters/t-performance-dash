import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/Widget';
import { DataPageHeader } from '../../modules/dashboard/DataPageHeader';
import { SideNavBar } from '../../modules/navigation/SideNavBar';
import { useDelimitatedRoute } from '../utils/router';
import { ALL_PAGES } from '../constants/pages';
import { DateSelection } from '../components/inputs/DateSelection/DateSelection';
import { OverviewDateSelection } from '../components/inputs/DateSelection/OverviewDateSelection';
import { ControlPanel } from '../components/controls/ControlPanel';
import { StationSelectorWidget } from '../components/widgets/StationSelectorWidget';
import { usePresetsOnFirstLoad } from '../utils/firstLoad';
import { Footer } from './Footer';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = !useBreakpoint('md');
  const { line, page, query } = useDelimitatedRoute();
  const { busRoute, queryType } = query;
  const section = page ? ALL_PAGES[page]?.section : undefined;
  const showControlParams = !isMobile && section && line && section !== 'today';
  usePresetsOnFirstLoad(section, query);

  // remove this once bottom nav is done.
  const getDatePicker = () => {
    if (section === 'trips' || section === 'line')
      return <DateSelection type={queryType ?? 'range'} />;
    if (section === 'overview') return <OverviewDateSelection />;
  };

  return (
    <div className="flex min-h-full flex-col justify-between">
      <SideNavBar />

      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-2 md:py-6">
            <div className="h-full px-4 sm:px-6 md:px-8">
              {showControlParams && (
                <ControlPanel
                  section={section}
                  line={line}
                  queryType={queryType}
                  busRoute={busRoute}
                />
              )}
              <WidgetPage>
                <DataPageHeader />
                {children}
              </WidgetPage>
            </div>
          </div>
        </main>
        {isMobile && (
          <div className="pb-safe fixed bottom-0 z-20 flex w-full flex-col justify-center bg-gray-300">
            {getDatePicker()}
            <div className="flex flex-row items-center justify-center border border-t-0 border-mbta-darkRed bg-white">
              <StationSelectorWidget line={'RL'} />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};
