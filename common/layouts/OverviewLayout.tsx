import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/Widget';
import { DataPageHeader } from '../../modules/dashboard/DataPageHeader';
import { OverviewDateSelection } from '../components/inputs/DateSelection/OverviewDateSelection';

export const OverviewLayout = ({ children }) => {
  const isMobile = !useBreakpoint('md');

  return (
    <>
      {!isMobile && (
        <div className="w-sm fixed right-4 top-4 z-10">
          <OverviewDateSelection />
        </div>
      )}

      <WidgetPage>
        <DataPageHeader />
        {children}
      </WidgetPage>
    </>
  );
};
