import React, { Fragment } from 'react';

import TmLogoSvg from '../../public/tm-logo-big.svg';
import { DonateButton } from '../../common/components/donate/DonateButton';
import { SideNavigation } from './SideNavigation';

export const SideNavBar = () => {
  return (
    <>
      <div className="bg-tm-grey text-gray-300">
        <div className="fixed inset-y-0 flex w-64 flex-col overflow-y-hidden bg-tm-grey">
          <div className="sticky flex flex-shrink-0 px-6 pb-2 pt-5">
            <TmLogoSvg alt="TransitMatters Logo" />
          </div>
          <div className="relative flex flex-col overflow-y-auto pb-4">
            <div className="fixed h-5 w-64 bg-gradient-to-b from-tm-grey to-transparent"></div>
            <SideNavigation />
            <div className="fixed bottom-12 h-5 w-64 bg-gradient-to-t from-tm-grey to-transparent"></div>
          </div>
          <DonateButton />
        </div>
      </div>
    </>
  );
};
