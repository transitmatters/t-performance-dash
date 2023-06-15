import React, { useState } from 'react';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

export const DonateButton: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <>
      <Link
        href="https://transitmatters.org/donate"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex w-full cursor-pointer justify-center gap-x-2 rounded-md bg-tm-red p-2 ring-white focus:outline-none focus:ring-1 md:justify-start"
      >
        <div className="relative flex flex-row items-center text-base text-stone-100 md:pl-1">
          <FontAwesomeIcon icon={hovered ? faHeartSolid : faHeart} className="pr-2" size="lg" />
          <p>Donate</p>
        </div>
      </Link>
    </>
  );
};
