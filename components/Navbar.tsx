import React from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ActiveLink } from './utils/ActiveLink';

export const Navbar = () => {
  return (
    <>
      <div>
        <Disclosure as="nav" className="bg-neutral-700 shadow">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                <div className="relative flex h-16 justify-between">
                  <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                      ) : (
                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                      )}
                    </Disclosure.Button>
                  </div>
                  <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                    <div className="flex flex-shrink-0 items-center">
                      <img
                        className="block h-6 w-auto stroke-black lg:hidden"
                        src="tm-logo.svg"
                        alt="Your Company"
                      />
                      <img
                        className="hidden h-6 w-auto stroke-black lg:block"
                        src="tm-logo.svg"
                        alt="Your Company"
                      />
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                      <ActiveLink href="/" activeClassName="border-white">
                        <a className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-white">
                          Data Dashboard
                        </a>
                      </ActiveLink>
                      <ActiveLink href="/slowzones" activeClassName="border-white">
                        <a className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-white hover:border-white hover:text-slate-200">
                          Slow Zones
                        </a>
                      </ActiveLink>
                    </div>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pt-2 pb-4">
                  {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                  <ActiveLink href="/" activeClassName="border-white ">
                    <Disclosure.Button
                      as="a"
                      href="#"
                      className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-white hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
                    >
                      Data Dashboard
                    </Disclosure.Button>
                  </ActiveLink>
                  <ActiveLink href="/slowzones" activeClassName="border-white">
                    <Disclosure.Button
                      as="a"
                      href="#"
                      className="block border-l-4 border-transparent py-2 pl-3 pr-4 font-medium text-white  hover:border-white hover:bg-gray-50 hover:text-gray-700"
                    >
                      Slow Zones
                    </Disclosure.Button>
                  </ActiveLink>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
    </>
  );
};
