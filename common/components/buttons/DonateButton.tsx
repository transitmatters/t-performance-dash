import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';

export const DonateButton: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <>
      <Link
        href="https://transitmatters.org/donate"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group flex w-full cursor-pointer justify-start gap-x-2 rounded-md ring-white focus:outline-none focus:ring-1 md:justify-start"
      >
        <div className="relative  flex flex-row items-center gap-2 text-sm text-stone-100 md:pl-1 ">
          <div className="group flex h-8 w-8 items-center justify-center rounded-full bg-tm-red group-hover:bg-white">
            <FontAwesomeIcon icon={faHeartSolid} size="lg" className="group-hover:text-tm-red" />
          </div>
          <p className="group-hover:text-blue-500">Donate</p>
        </div>
      </Link>
    </>
  );
};
