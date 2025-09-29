import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { StarBorder } from '../StarBorder/StarBorder';

export const DonateButton: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <StarBorder speed="10s">
      <Link
        href="https://transitmatters.org/donate"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="rounded-mdring-white group bg-tm-red flex w-full cursor-pointer justify-start gap-x-2 rounded-md hover:bg-white focus:ring-1 focus:outline-none md:justify-start"
      >
        <div className="relative flex flex-row items-center gap-2 pl-1 text-sm text-stone-100">
          <div className="group flex h-8 w-8 items-center justify-center rounded-full">
            <FontAwesomeIcon
              icon={faHeartSolid}
              size="lg"
              className="group-hover:text-tm-red transition-transform duration-200 group-hover:scale-125"
            />
          </div>
          <p className="group-hover:text-tm-red">Make a donation</p>
        </div>
      </Link>
    </StarBorder>
  );
};
