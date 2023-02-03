'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import classNames from 'classnames';
import TmLogoSvg from '../public/tm-logo-big.svg';
import Menu from '../public/Icons/Menu.svg';
import Close from '../public/Icons/Close.svg';
import { NavBarKeys, NAV_BAR_LINKS } from '../constants/NavBarLinks';
import { NavBarButton } from './general/NavBarButton';
import { LineSelectorSideBar } from './Dropdowns/LineSelectorSidebar';
import { MobileMenuButton } from './general/MobileMenuButton';
import { LineSelectorNavBar } from './Dropdowns/LineSelectorNavBar';

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed top-0 z-50 flex w-full items-center justify-between overflow-x-hidden bg-tm-grey p-2">
      <TmLogoSvg className="h-7 w-auto sm:h-12" alt="TransitMatters Logo" />
      <div className="flex sm:hidden">
        {open ? (
          <Close
            alt="Close"
            className="h-4 w-4 sm:hidden"
            onClick={() => {
              setOpen(!open);
            }}
          />
        ) : (
          <Menu
            alt="Menu"
            className="h-4 w-4 sm:hidden"
            onClick={() => {
              setOpen(!open);
            }}
          />
        )}
      </div>
      <div className="hidden h-11 sm:flex">
        {Object.entries(NAV_BAR_LINKS).map(([key, value]) => {
          if (value.type === NavBarKeys.list) {
            return <LineSelectorNavBar key={value.name} value={value} />;
          }
          return (
            <Link key={key} href={`/${key}`}>
              <NavBarButton value={value} />
            </Link>
          );
        })}
      </div>
      <div
        className={classNames(
          open ? 'translate-x-0 opacity-100 sm:hidden' : 'translate-x-full opacity-0',
          'duration-400 m-t-8 m-t-4 fixed top-11 right-0 flex h-full w-full transform flex-col gap-y-4 overflow-auto bg-tm-grey pt-4 pl-2 transition-all ease-in-out sm:top-16'
        )}
      >
        {Object.entries(NAV_BAR_LINKS).map(([key, value]) => {
          if (value.type === NavBarKeys.list && setOpen) {
            return <LineSelectorSideBar key={key} value={value} setOpen={setOpen} />;
          }
          return <MobileMenuButton key={key} value={value} />;
        })}
      </div>
    </div>
  );
};
