import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import Image from 'next/image';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { SideNavigation } from './SideNavigation';

export const MobileNavHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-tm-grey text-gray-300">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <div className="relative z-40 w-full">
            <div className="fixed bottom-0 right-0 top-0 bg-gray-600 bg-opacity-75" />

            <div className="fixed bottom-0 left-0 right-0 top-12 flex w-full flex-col bg-tm-grey">
              <div className="h-0 flex-1 overflow-y-auto px-4 pt-5">
                <div className="h-0 flex-1 text-white md:mt-5">
                  <SideNavigation setSidebarOpen={setSidebarOpen} />
                </div>
              </div>
              <div className="fixed bottom-[10.25rem] h-3 w-full bg-gradient-to-t from-tm-grey to-transparent"></div>
              <div className="flex flex-col gap-1 px-6 py-2 ">
                <Link
                  href="https://transitmatters.org/transitmatters-labs"
                  className="text-white hover:text-blue-500"
                >
                  About
                </Link>
                <Link
                  href="https://transitmatters.org/join"
                  className="text-white hover:text-blue-500"
                >
                  Join Us
                </Link>
                <Link
                  href="https://forms.gle/SKYtxgKSyCrYxM1v7"
                  className="text-white hover:text-blue-500"
                >
                  Feedback
                </Link>
                <p className="text-white">
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
        </Transition.Root>

        <div className="top-0 z-10 flex flex-row items-center justify-between bg-tm-grey p-2">
          <Link
            href="/"
            className="h-5 w-auto overflow-hidden focus:outline-none"
            onClick={() => setSidebarOpen(false)}
          >
            <Image src={'/TMLogo.png'} alt="TransitMatters Logo" width={208} height={19.5} />
          </Link>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="sr-only">{'Close Sidebar'}</span>
            {sidebarOpen ? (
              <XMarkIcon className="h-8 w-8 text-stone-100" aria-hidden="true" />
            ) : (
              <Bars3Icon className="h-8 w-8 text-stone-100" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};
