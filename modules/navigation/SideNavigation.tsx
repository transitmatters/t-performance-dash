import React from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHouse, faWarning } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import { SubwaySection } from '../../common/components/nav/SubwaySection';
import { BusSection } from '../../common/components/nav/BusSection';
import { useDelimitatedRoute } from '../../common/utils/router';

interface SideNavigationProps {
  close?: (
    focusableElement?:
      | HTMLElement
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.MutableRefObject<HTMLElement | null>
      | undefined
  ) => void;
}

export const SideNavigation: React.FC<SideNavigationProps> = ({ close }) => {
  const { page } = useDelimitatedRoute();
  return (
    <nav className="flex flex-col pb-3 text-sm md:pb-0">
      <ul role={'navigation'} className="flex flex-col gap-y-1">
        <Link
          href="/"
          className={classNames(
            page === 'landing' ? 'bg-opacity-75' : 'bg-opacity-0',
            'flex flex-row items-center gap-2 rounded-md bg-black hover:bg-opacity-25 hover:text-white focus:outline-1'
          )}
          onClick={() => (close ? close() : undefined)}
        >
          <div className="flex  h-8 w-8 items-center justify-center rounded-full">
            <FontAwesomeIcon icon={faHouse} size="lg" />
          </div>
          <h2>Home</h2>
        </Link>
        <Link
          href="/system/slowzones"
          className={classNames(
            page === 'systemSlowzones' ? 'bg-opacity-75' : 'bg-opacity-0',
            'flex flex-row items-center gap-2 rounded-md bg-black bg-opacity-0 hover:bg-opacity-25 hover:text-white'
          )}
          onClick={() => (close ? close() : undefined)}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full">
            <FontAwesomeIcon icon={faWarning} size="lg" />
          </div>
          <h2>Slow Zones</h2>
        </Link>
        <hr className="border-stone-600" />
        <SubwaySection close={close} />
        <BusSection close={close} />
      </ul>
    </nav>
  );
};
