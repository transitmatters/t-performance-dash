import React from 'react';
import Link from 'next/link';

import Image from 'next/image';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { SideNavigation } from './SideNavigation';

export const SideNavBar = () => {
  return (
    <>
      <div className="bg-tm-grey text-gray-200 w-64 fixed flex flex-col top-0 left-0 h-full">
        <Link href="/" className="top-0 flex flex-shrink-0 justify-center px-4 pb-2 pt-6 w-full">
          <Image src={'/TMLogo.png'} alt="TransitMatters Logo" width={3204} height={301} />
        </Link>
        <div className="inset-y-0  pl-2 flex flex-col overflow-y-auto bg-tm-grey h-full justify-between pb-1">
          <div className="relative flex flex-col pb-4">
            <div className="sticky h-5 w-full bg-gradient-to-b from-tm-grey to-transparent"></div>
            <SideNavigation />
          </div>
          <div className="flex flex-col gap-1 px-6 py-2 text-sm">
            <Link
              href="https://transitmatters.org/transitmatters-labs"
              className="text-white hover:text-blue-500"
            >
              About
            </Link>
            <Link href="https://transitmatters.org/join" className="text-white hover:text-blue-500">
              Join us
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
                Source code
              </Link>{' '}
              /{' '}
              <Link href="/opensource" className="text-white hover:text-blue-500">
                attributions
              </Link>
            </p>
            <DonateButton />
          </div>
        </div>
      </div>
    </>
  );
};
