import React from 'react';
import Image from 'next/image';
import TmLogoSvg from '../../public/tm-logo.svg';

export const TMHeader = () => {
  return (
    <div>
      <Image
        className="hidden h-3 w-auto stroke-black sm:block"
        src={TmLogoSvg}
        alt="Your Company"
      />
    </div>
  );
};
