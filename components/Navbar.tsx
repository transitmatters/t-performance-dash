import React from 'react';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import TmLogoSvg from '../public/tm-logo-big.svg';
import { ActiveLink } from './utils/ActiveLink';

export const Navbar = () => {
  return (
    <>
      <div className="sticky top-0 w-full">
        <Disclosure as="nav" className="bg-tm-grey shadow-sm">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl sm:px-6 sm:px-8">
                <div className="relative flex justify-between">
                  <div className="flex flex-1 items-center pl-1 sm:items-stretch sm:justify-start">
                    <div className="flex flex-shrink-0 items-center">
                      <Image
                        className="block h-7 w-auto stroke-black sm:hidden"
                        src={TmLogoSvg}
                        alt="Your Company"
                      />
                      <Image
                        className="hidden h-6 w-auto stroke-black sm:block"
                        src={TmLogoSvg}
                        alt="Your Company"
                      />
                    </div>
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      {/* Current: "border-indigo-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" */}
                      <ActiveLink href="/data" activeClassName="border-white">
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
                  <div className="flex items-center justify-between sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon className="block h-7 w-7" aria-hidden="true" color="white" />
                      ) : (
                        <Bars3Icon className="block h-7 w-7" aria-hidden="true" color="white" />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pt-2 pb-4">
                  {/* Current: "bg-indigo-50 border-indigo-500 text-indigo-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                  <ActiveLink href="/data" activeClassName="border-white ">
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
