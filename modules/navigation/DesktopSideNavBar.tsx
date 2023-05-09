import React, { Fragment } from 'react';

import TmLogoSvg from '../../public/tm-logo-big.svg';
import { SideNavigation } from './SideNavigation';

export const SideNavBar = () => {
  return (
    <>
      <div className="bg-tm-grey text-gray-300">
        <div className="fixed inset-y-0 flex w-64 flex-col bg-tm-grey">
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col overflow-y-auto pb-4 pt-5">
              <div className="flex flex-shrink-0 px-6">
                <TmLogoSvg alt="TransitMatters Logo" />
              </div>
              <div className="mt-5 flex flex-col ">
                <SideNavigation />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
