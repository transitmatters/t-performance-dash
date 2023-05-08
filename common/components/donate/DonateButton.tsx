import React, { useState } from 'react';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
export const DonateButton: React.FC = () => {
  const [hovered, setHovered] = useState<boolean>(false);
  return (
    <div className="p-2">
      <button
        onClick={() => console.log('donate')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex w-full cursor-pointer justify-center gap-x-2 rounded-md bg-tm-red p-2"
      >
        <div className="relative flex flex-row items-center">
          <FontAwesomeIcon
            icon={hovered ? faHeartSolid : faHeart}
            className="fixed -translate-x-full pr-2"
          />
          <p>Donate</p>
        </div>
      </button>
    </div>
  );
};
