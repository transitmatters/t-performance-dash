import React, { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import Image from 'next/image';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { SideNavigation } from './SideNavigation';

export const MobileNavHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 even bg-tm-grey text-gray-300 ">
        <div className="top-0 z-10 flex flex-row items-center overflow-y-auto justify-between bg-tm-grey p-2">
          <Link
            href="/"
            className="h-5 w-auto overflow-hidden focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <Image src={'/TMLogo.png'} alt="TransitMatters Logo" width={208} height={19.5} />
          </Link>


          <Popover >
            {({ open, close }) => (

              <><Popover.Button
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
                onClick={() => setSidebarOpen(!sidebarOpen)}

              >
                <span className="sr-only">{'Close Sidebar'}</span>
                {open ? (
                  <XMarkIcon className="h-8 w-8 text-stone-100" aria-hidden="true" />
                ) : (
                  <Bars3Icon className="h-8 w-8 text-stone-100" aria-hidden="true" />
                )}
              </Popover.Button>
                <Popover.Overlay className="fixed inset-0 bg-black opacity-30 mt-[54px]" />
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 "
                  enterTo="opacity-100 "
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 "
                  leaveTo="opacity-0 "
                >

                  <Popover.Panel className="absolute flex flex-col overflow-y-auto h-[100vh] mt-2 z-10 pb-40 w-full max-w-[18rem] transform px-8 right-0 bg-tm-grey backdrop-blur-md bg-opacity-90 shadow-inner">

                    <div className="pt-5 md:mt-5 text-white">
                      <SideNavigation close={close} />
                    </div>
                    <hr className="border-stone-600" />
                    <div className="flex flex-col gap-1 py-2 text-sm">
                      <Link
                        href="https://transitmatters.org/transitmatters-labs"
                        className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
                      >
                        <div className="h-8 w-8" />
                        About
                      </Link>
                      <Link
                        href="https://transitmatters.org/join"
                        className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
                      >
                        <div className="h-8 w-8" />

                        Join Us
                      </Link>
                      <Link
                        href="https://forms.gle/SKYtxgKSyCrYxM1v7"
                        className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
                      >
                        <div className="h-8 w-8" />

                        Feedback
                      </Link>
                      <Link
                        href="https://github.com/transitmatters/t-performance-dash"
                        className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
                      >
                        <div className="h-8 w-8" />

                        Source Code
                      </Link>
                      <Link href="/opensource"
                        className="text-white hover:text-blue-500 flex items-center flex-row gap-2"
                      >
                        <div className="h-8 w-8" />

                        Attributions
                      </Link>
                      <hr className="border-stone-600" />

                      <DonateButton />
                    </div>
                  </Popover.Panel>
                </Transition></>
            )}
          </Popover>

        </div>

      </div>
    </>
  );
};
