import React from 'react';
import { WidgetPage } from '../components/widgets/Widget';
import { DateSelection } from '../components/inputs/DateSelection/DateSelection';
import { useDelimitatedRoute } from '../utils/router';
import { ALL_PAGES } from '../constants/pages';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { DataPageHeader } from '../../modules/dashboard/DataPageHeader';

export const TripExplorerLayout = ({ children }) => {
  const { page } = useDelimitatedRoute();
  const isMobile = !useBreakpoint('md');
  return (
    <>
      {!isMobile && (
        <div className="w-sm fixed right-4 top-4 z-10">
          <DateSelection range={ALL_PAGES[page]?.section === 'range'} />
        </div>
      )}
      <WidgetPage>
        <DataPageHeader />

        {children}
      </WidgetPage>
    </>
  );
};
