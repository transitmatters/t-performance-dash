import React from 'react';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import TmLogoSvg from '../../public/tm-logo-big.svg';

interface MobileNavTitleProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const MobileNavTitle: React.FC<MobileNavTitleProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="top-0 z-10 flex flex-row items-center justify-between bg-tm-grey p-2">
      <Link href="/" onClick={() => setSidebarOpen(false)} className="focus:outline-none">
        <TmLogoSvg className="mr-4 h-7 w-auto text-black" alt="TransitMatters Logo" />
      </Link>
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span className="sr-only">{sidebarOpen ? 'Open Sidebar' : 'Close Sidebar'}</span>
        {sidebarOpen ? (
          <XMarkIcon className="h-8 w-8 text-stone-100" aria-hidden="true" />
        ) : (
          <Bars3Icon className="h-8 w-8 text-stone-100" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};
