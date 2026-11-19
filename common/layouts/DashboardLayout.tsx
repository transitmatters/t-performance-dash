import type { ReactNode } from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/WidgetPage';
import { MobileHeader } from '../../modules/dashboard/MobileHeader';
import { DesktopHeader } from '../../modules/dashboard/DesktopHeader';
import { usePageControls } from '../hooks/usePageControls';
import { MobileControlPanel } from '../components/controls/MobileControlPanel';
import { CIPBanner } from '../components/CIPBanner';
import { usePageTitle } from '../hooks/usePageHeading';

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = !useBreakpoint('md');
  const { visible: showControls } = usePageControls();
  // Set here rather than by each page, so it names the line and survives a page's early return.
  const title = usePageTitle();

  return (
    <div className="flex flex-1 flex-col">
      <title>{title}</title>
      <CIPBanner />
      <div className="flex-1">
        {isMobile ? <MobileHeader /> : <DesktopHeader />}
        <div className="py-2 md:py-4">
          <div className="h-full px-2 sm:px-4 md:px-6">
            <WidgetPage>{children}</WidgetPage>
          </div>
        </div>
      </div>
      {isMobile && showControls && <MobileControlPanel />}
    </div>
  );
};
