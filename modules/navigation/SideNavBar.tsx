import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

import TmLogoSvg from '../../public/tm-logo-big.svg';
import { SideNavigation } from './SideNavigation';

export const SideNavBar = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <div className="bg-tm-grey text-gray-300">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-40 w-full md:hidden" onClose={setSidebarOpen}>
            <div className="fixed bottom-0 right-0 top-0 bg-gray-600 bg-opacity-75" />

            <div className="fixed bottom-0 right-0 top-[61px] z-40 flex w-full md:top-0">
              <Dialog.Panel className="relative flex w-full flex-1 flex-col bg-tm-grey">
                <div className="h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5">
                  <div className="mt-5 h-0 flex-1 text-white">
                    <SideNavigation setSidebarOpen={setSidebarOpen} />
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden bg-tm-grey md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
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
        <div className="flex flex-1 flex-col md:pl-64">
          <div className="bg-design-tmgrey sticky top-0 z-10 flex flex-row items-center justify-between p-2 md:hidden">
            <TmLogoSvg className="mr-4 h-9 w-auto text-black" alt="TransitMatters Logo" />
            <button
              type="button"
              className="-ml-0.5 -mt-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400"
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
        </div>
      </div>
    </>
  );
};
