import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import TmLogoSvg from '../../public/tm-logo-big.svg';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { FeedbackButton } from '../../common/components/buttons/FeedbackButton';
import { SideNavigation } from './SideNavigation';

export const MobileNavHeader = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="sticky top-0 z-10 bg-tm-grey text-gray-300">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 w-full" onClose={setSidebarOpen}>
            <div className="fixed bottom-0 right-0 top-0 bg-gray-600 bg-opacity-75" />

            <Dialog.Panel className="fixed bottom-0 left-0 right-0 top-0 flex w-full flex-col bg-tm-grey">
              <div className="top-0 z-10 flex flex-row items-center justify-between bg-tm-grey p-2">
                <Link
                  href="/"
                  className="h-5 w-auto overflow-hidden focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <TmLogoSvg className="mr-4 h-5 w-auto text-black" alt="TransitMatters Logo" />
                </Link>

                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">{'Close Sidebar'}</span>
                  <XMarkIcon className="h-8 w-8 text-stone-100" aria-hidden="true" />
                </button>
              </div>
              <div className="h-0 flex-1 overflow-y-auto px-4 pt-5">
                <div className="h-0 flex-1 text-white md:mt-5">
                  <SideNavigation setSidebarOpen={setSidebarOpen} />
                </div>
              </div>
              <div className="fixed bottom-12 h-5 w-full bg-gradient-to-t from-tm-grey to-transparent"></div>
              <div className="flex flex-row gap-2 p-2">
                <DonateButton />
                <FeedbackButton />
              </div>
            </Dialog.Panel>
          </Dialog>
        </Transition.Root>

        <div className="flex flex-1 flex-col">
          <div className="top-0 z-10 flex flex-row items-center justify-between bg-tm-grey p-2">
            <Link href="/" className="h-5 w-auto">
              <TmLogoSvg className="mr-4 h-5 w-auto text-black" alt="TransitMatters Logo" />
            </Link>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">{'Open Sidebar'}</span>
              <Bars3Icon className="h-8 w-8 text-stone-100" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
