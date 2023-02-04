import React from 'react';
import { BottomNavBar } from './general/BottomNavBar';
import { SecondaryNavBar } from './general/SecondaryNavBar';
import { DataPageHeader } from './widgets/DataPageHeader';
import { WidgetPage } from './widgets/Widget';

export const DashboardLayoutMobile = ({ children }) => {
  return (
    <div className="flex w-full flex-col items-center">
      <WidgetPage>
        <DataPageHeader />
        {children}
      </WidgetPage>
      <SecondaryNavBar />
      <BottomNavBar />
    </div>
  );
};
