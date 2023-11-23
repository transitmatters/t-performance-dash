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
    <nav className="flex flex-col pb-3 md:px-4 md:pb-0 ">
      <ul role={'navigation'} className="flex flex-col gap-y-1">
        <Link href="/" className="hover:text-white flex flex-row gap-2 items-baseline text" onClick={() => close ? close() : undefined}>
          <FontAwesomeIcon icon={faHouse} />
          <h2>Home</h2>
        </Link>
        <Link href="/system/slowzones" className="hover:text-white flex flex-row gap-2 items-baseline text" onClick={() => close ? close() : undefined}>
          <FontAwesomeIcon icon={faWarning} />
          <h2>Slow Zones</h2>
        </Link>
        <NavSection title="Subway" content={<SubwaySection close={close} />} />

        <NavSection title="Bus" content={<BusSection close={close} />} />
      </ul>
    </nav>
  );
};
