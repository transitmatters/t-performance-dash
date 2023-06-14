import React from 'react';
import Link from 'next/link';

import TmLogoSvg from '../../public/tm-logo-big.svg';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { SideNavigation } from './SideNavigation';

export const SideNavBar = () => {
  return (
    <>
      <div className="bg-tm-grey text-gray-300">
        <div className="fixed inset-y-0 flex w-64 flex-col overflow-y-hidden bg-tm-grey">
          <Link href="/" className="sticky flex flex-shrink-0 px-6 pb-2 pt-6">
            <TmLogoSvg alt="TransitMatters Logo" />
          </Link>
          <div className="relative flex flex-grow flex-col overflow-y-auto pb-4">
            <div className="fixed h-5 w-64 bg-gradient-to-b from-tm-grey to-transparent"></div>
            <SideNavigation />
            <div className="fixed bottom-36 h-5 w-64 bg-gradient-to-t from-tm-grey to-transparent"></div>
          </div>
          <div className="flex flex-col gap-1 px-4 py-2 text-sm">
            <Link
              href="https://transitmatters.org/transitmatters-labs"
              className="text-white hover:text-blue-500"
            >
              About
            </Link>
            <Link href="https://transitmatters.org/join" className="text-white hover:text-blue-500">
              Join Us
            </Link>
            <Link
              href="https://forms.gle/SKYtxgKSyCrYxM1v7"
              className="text-white hover:text-blue-500"
            >
              Feedback
            </Link>
            <p>
              <Link
                href="https://github.com/transitmatters/t-performance-dash"
                className="text-white hover:text-blue-500"
              >
                Source Code
              </Link>{' '}
              /{' '}
              <Link href="/opensource" className="text-white hover:text-blue-500">
                Attributions
              </Link>
            </p>
            <DonateButton />
          </div>
        </div>
      </div>
    </>
  );
};
