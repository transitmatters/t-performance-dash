import React, { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import Image from 'next/image';
import { SideNavigation } from './SideNavigation';
import { ExtraMenuItems } from './ExtraMenuItems';

export const MobileNavHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="even bg-tm-grey sticky top-0 z-10 text-gray-300">
        <div className="bg-tm-grey top-0 z-10 flex flex-row items-center justify-between overflow-y-auto p-2">
          <Link
            href="/"
            className="h-5 w-auto overflow-hidden focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <Image src={'/TMLogo.png'} alt="TransitMatters Logo" width={208} height={19.5} />
          </Link>

          <Popover>
            {({ open, close }) => (
              <>
                <Popover.Button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:ring-2 focus:ring-gray-400 focus:outline-none focus:ring-inset"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="sr-only">{'Close Sidebar'}</span>
                  {open ? (
                    <XMarkIcon className="h-8 w-8 text-stone-100" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="h-8 w-8 text-stone-100" aria-hidden="true" />
                  )}
                </Popover.Button>
                <Popover.Overlay className="fixed inset-0 mt-[54px] bg-black opacity-30" />
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 "
                  enterTo="opacity-100 "
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 "
                  leaveTo="opacity-0 "
                >
                  <Popover.Panel className="bg-tm-grey bg-opacity-90 absolute right-0 z-10 mt-2 flex h-[100vh] w-full max-w-[18rem] transform flex-col overflow-y-auto px-8 pb-40 shadow-inner backdrop-blur-md">
                    <div className="pt-5 text-white md:mt-5">
                      <SideNavigation close={close} />
                    </div>
                    <hr className="border-stone-600" />
                    <ExtraMenuItems />
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>
    </>
  );
};
