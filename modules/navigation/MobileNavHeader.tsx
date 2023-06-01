import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import { DonateButton } from '../../common/components/buttons/DonateButton';
import { FeedbackButton } from '../../common/components/buttons/FeedbackButton';
import { SideNavigation } from './SideNavigation';
import { MobileNavTitle } from './MobileNavTitle';

interface MobileNavHeaderProps {
  isLanding?: boolean;
}

export const MobileNavHeader: React.FC<MobileNavHeaderProps> = ({ isLanding = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-tm-grey text-gray-300">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 w-full" onClose={setSidebarOpen}>
            <div className="fixed bottom-0 right-0 top-0 bg-gray-600 bg-opacity-75" />
            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex w-full flex-col bg-tm-grey">
              {/* Hacky fix - this nav title overlays a second title in the dialog. Otherwise tapping the logo closes the dialog without navigating to home */}
              <MobileNavTitle sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <div className="h-0 flex-1 overflow-y-auto px-4 pt-5">
                <div className="h-0 flex-1 text-white md:mt-5">
                  <SideNavigation setSidebarOpen={setSidebarOpen} isLanding={isLanding} />
                </div>
              </div>
              <div className="fixed bottom-12 h-5 w-full bg-gradient-to-t from-tm-grey to-transparent"></div>
              <div className="flex flex-row gap-2 p-2">
                <DonateButton />
                <FeedbackButton />
              </div>
            </Dialog.Panel>
          </Dialog>
        </Transition.Root>

        <div className="flex flex-1 flex-col">
          <MobileNavTitle sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
      </div>
    </>
  );
};
