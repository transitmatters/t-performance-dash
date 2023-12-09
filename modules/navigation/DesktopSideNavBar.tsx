import React from 'react';
import Link from 'next/link';

import Image from 'next/image';
import { SideNavigation } from './SideNavigation';
import { ExtraMenuItems } from './ExtraMenuItems';

export const SideNavBar = () => {
  return (
    <>
      <div className="fixed left-0 top-0 flex h-full w-64 flex-col bg-tm-grey text-gray-200">
        <Link href="/" className="top-0 flex w-full flex-shrink-0 justify-center px-4 pb-2 pt-6">
          <Image src={'/TMLogo.png'} alt="TransitMatters Logo" width={3204} height={301} />
        </Link>
        <div className="inset-y-0  flex h-full flex-col justify-between overflow-y-auto bg-tm-grey px-6 pb-1">
          <div className="relative flex flex-col pb-4">
            <div className="sticky h-5 w-full bg-gradient-to-b from-tm-grey to-transparent"></div>
            <SideNavigation />
          </div>
          <ExtraMenuItems />
        </div>
      </div>
    </>
  );
};
