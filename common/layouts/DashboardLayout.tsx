import React from 'react';
import { WidgetPage } from '../components/widgets/Widget';
import { SideNavBar } from '../../modules/navigation/desktop/SideNavBar';
import { DataPageHeader } from '../../modules/dashboard/DataPageHeader';
import { Footer } from './Footer';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-full flex-col justify-between">
      <SideNavBar />
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-2 md:py-6">
            <div className="h-full px-4 sm:px-6 md:px-8">
              <WidgetPage>
                <DataPageHeader />
                {children}
              </WidgetPage>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};
