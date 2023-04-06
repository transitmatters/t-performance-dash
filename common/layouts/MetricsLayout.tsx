import React from 'react';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { WidgetPage } from '../components/widgets/Widget';
import { DateSelection } from '../components/inputs/DateSelection/DateSelection';
import { DataPageHeader } from '../../modules/dashboard/DataPageHeader';

export const MetricsLayout = ({ children }) => {
  const isMobile = !useBreakpoint('md');

  return (
    <>
      {!isMobile && (
        <div className="w-sm fixed right-4 top-4 z-10">
          <DateSelection range />
        </div>
      )}

      <WidgetPage>
        <DataPageHeader />
        {children}
      </WidgetPage>
    </>
  );
};
