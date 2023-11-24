import React from 'react';
import Link from 'next/link';
import { NavSection } from '../../common/components/nav/NavSection';
import { SubwaySection } from '../../common/components/nav/SubwaySection';
import { BusSection } from '../../common/components/nav/BusSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faWarning } from '@fortawesome/free-solid-svg-icons';

interface SideNavigationProps {
  close?: (focusableElement?: HTMLElement | React.MouseEvent<HTMLElement, MouseEvent> | React.MutableRefObject<HTMLElement | null> | undefined) => void
}

export const SideNavigation: React.FC<SideNavigationProps> = ({ close }) => {
  return (
    <nav className="flex flex-col pb-3 md:px-4 md:pb-0 text-sm">
      <ul role={'navigation'} className="flex flex-col gap-y-1">
        <Link href="/" className="hover:text-white flex flex-row gap-2 items-baseline focus:outline-1" onClick={() => close ? close() : undefined}>
          <div className="rounded-full  flex items-center w-8 h-8 justify-center">
            <FontAwesomeIcon icon={faHouse} size="lg" />
          </div>
          <h2>Home</h2>
        </Link>
        <Link href="/system/slowzones" className="hover:text-white flex flex-row gap-2 items-baseline" onClick={() => close ? close() : undefined}>
          <div className="rounded-full flex items-center w-8 h-8 justify-center">
            <FontAwesomeIcon icon={faWarning} size="lg" />
          </div>
          <h2>Slow Zones</h2>
        </Link>
        <hr className="border-stone-600" />

        <NavSection title="Subway" content={<SubwaySection close={close} />} />

        <NavSection title="Bus" content={<BusSection close={close} />} />
      </ul>
    </nav>
  );
};
