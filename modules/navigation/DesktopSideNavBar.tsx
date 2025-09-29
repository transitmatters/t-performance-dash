import React from 'react';
import Link from 'next/link';

import Image from 'next/image';
import { SideNavigation } from './SideNavigation';
import { ExtraMenuItems } from './ExtraMenuItems';

export const SideNavBar = () => {
  return (
    <>
      <div className="bg-tm-grey fixed top-0 left-0 flex h-full w-64 flex-col text-gray-200">
        <Link href="/" className="top-0 flex w-full flex-shrink-0 justify-center px-4 pt-6 pb-2">
          <Image src={'/TMLogo.png'} alt="TransitMatters Logo" width={3204} height={301} />
        </Link>
        <div className="bg-tm-grey inset-y-0 flex h-full flex-col justify-between overflow-y-auto px-6 pb-1">
          <div className="relative flex flex-col pb-4">
            <div className="from-tm-grey sticky h-5 w-full bg-gradient-to-b to-transparent"></div>
            <SideNavigation />
          </div>
          <ExtraMenuItems />
        </div>
      </div>
    </>
  );
};
