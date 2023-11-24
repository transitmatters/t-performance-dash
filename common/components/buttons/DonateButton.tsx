import React, { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { COLORS } from '../../constants/colors';

export const DonateButton: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <>
      <Link
        href="https://transitmatters.org/donate"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex w-full cursor-pointer justify-start gap-x-2 rounded-md ring-white focus:outline-none focus:ring-1 md:justify-start"
      >
        <div className="relative flex flex-row items-center text-sm text-stone-100 md:pl-1 gap-2">
          <div className="h-8 w-8 rounded-full bg-tm-red flex justify-center items-center">
            <FontAwesomeIcon icon={faHeartSolid} size="lg" />
          </div>
          <p>Donate</p>
        </div>
      </Link>
    </>
  );
};
