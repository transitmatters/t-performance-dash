import React from 'react';
import { BottomNavBar } from './general/BottomNavBar';
import { SecondaryNavBar } from './general/SecondaryNavBar';
import { classNames } from './utils/tailwind';
import { DataPageHeader } from './widgets/DataPageHeader';
import { WidgetPage } from './widgets/Widget';

export const DashboardLayout = ({ children }) => {
  return (
    <div className={classNames('flex w-full flex-col items-center')}>
      <DataPageHeader dateString="Today (TBD)" />
      <WidgetPage>{children}</WidgetPage>
      <SecondaryNavBar />
      <BottomNavBar />
    </div>
  );
};
