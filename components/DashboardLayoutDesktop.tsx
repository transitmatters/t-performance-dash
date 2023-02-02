import React from 'react';
import { SecondaryNavBar } from './general/SecondaryNavBar';
import { SideNavBar } from './SideNavBar';
import { DataPageHeader } from './widgets/DataPageHeader';
import { WidgetPage } from './widgets/Widget';

export const DashboardLayoutDesktop = ({ children }) => {
  return (
    <div className="flex h-full flex-row">
      <SideNavBar />
      <div className="flex h-full w-full flex-col items-center pl-40">
        <DataPageHeader dateString="Today (TBD)" />
        <WidgetPage>{children}</WidgetPage>
        <SecondaryNavBar />
      </div>
    </div>
  );
};
