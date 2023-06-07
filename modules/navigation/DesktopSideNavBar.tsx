import React from 'react';

import Image from 'next/image';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { FeedbackButton } from '../../common/components/buttons/FeedbackButton';
import { SideNavigation } from './SideNavigation';

export const SideNavBar = () => {
  return (
    <>
      <div className="bg-tm-grey text-gray-300">
        <div className="fixed inset-y-0 flex w-64 flex-col overflow-y-hidden bg-tm-grey">
          <div className="sticky flex flex-shrink-0 px-6 pb-2 pt-6">
            <Image
              src={'/Logo_wordmark_dark.png'}
              alt="TransitMatters Logo"
              width={3204}
              height={301}
            />
          </div>
          <div className="relative flex flex-grow flex-col overflow-y-auto pb-4">
            <div className="fixed h-5 w-64 bg-gradient-to-b from-tm-grey to-transparent"></div>
            <SideNavigation />
            <div className="fixed bottom-24 h-5 w-64 bg-gradient-to-t from-tm-grey to-transparent"></div>
          </div>
          <div className="flex flex-col gap-2 px-4 py-2">
            <FeedbackButton />
            <DonateButton />
          </div>
        </div>
      </div>
    </>
  );
};
