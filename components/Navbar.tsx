import React, { useState } from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import Heart from '../public/Icons/Heart.svg';
import MBTA from '../public/Icons/MBTA.svg';
import Message from '../public/Icons/Message.svg';
import Profile from '../public/Icons/Profile.svg';
import Star from '../public/Icons/Star.svg';
import Train from '../public/Icons/Train.svg';
import TmLogoSvg from '../public/tm-logo-big.svg';
import Menu from '../public/Icons/Menu.svg';
import Close from '../public/Icons/Close.svg';
import { ActiveLink } from './utils/ActiveLink';
const navBarLinks = {
  line: { name: 'Line Dashboards', icon: Train },
  system: { name: 'System-Wide Dashboards', icon: MBTA },
  ourSelection: { name: 'Our Selection', icon: Star },
  personalized: { name: 'Personalized Dashboard', icon: Profile },
  donate: { name: 'Donate', icon: Heart },
  feedback: { name: 'Feedback', icon: Message },
};

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed top-0 z-50 flex w-full items-center justify-between overflow-x-hidden bg-tm-grey p-2">
      <Image className="h-7 w-auto sm:h-12" src={TmLogoSvg} alt="Transit Matters Logo" />
      <div className="flex sm:hidden">
        <Image
          className="h-4 w-auto sm:hidden"
          src={open ? Close : Menu}
          alt="Menu"
          onClick={() => {
            setOpen(!open);
          }}
        />
      </div>
      <div className="hidden h-11 sm:flex">
        {Object.entries(navBarLinks).map(([key, value]) => {
          return (
            <ActiveLink key={key} href={`/${key}`} activeClassName="border-white">
              <a
                className={classNames(
                  'inline-flex h-full items-center gap-x-2 border-b-2 border-transparent px-4 text-base text-white hover:bg-design-subtitleGrey'
                )}
              >
                <Image className="h-5 w-auto" src={value.icon} alt="Transit Matters Logo" />
                <p className="text-center">{value.name}</p>
              </a>
            </ActiveLink>
          );
        })}
      </div>
      <div
        className={classNames(
          open ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
          'duration-400 m-t-8 m-t-4 fixed top-11 right-0 flex h-screen w-screen transform flex-col gap-y-4 overflow-auto bg-tm-grey pt-4 pl-2 transition-all ease-in-out sm:top-16'
        )}
      >
        {Object.entries(navBarLinks).map(([key, value], index) => {
          return (
            <ActiveLink key={key} href={`/${key}`} activeClassName="border-white">
              <a
                className={classNames(
                  'inline-flex items-center gap-x-2 border-b-2 border-transparent px-1 text-base text-white',
                  index === 4 ? 'pt-5' : 'pt-1'
                )}
              >
                <Image className="h-5 w-auto" src={value.icon} alt="Transit Matters Logo" />
                {value.name}
              </a>
            </ActiveLink>
          );
        })}
      </div>
    </div>
  );
};
