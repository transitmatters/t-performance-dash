import Link from 'next/link';
import React from 'react';
import { DonateButton } from '../../common/components/buttons/DonateButton';

export const ExtraMenuItems: React.FC = () => {
  return (
    <div className="flex flex-col gap-1 py-2 text-sm">
      <Link
        href="https://transitmatters.org/transitmatters-labs"
        className="flex flex-row items-center gap-2 text-white hover:text-blue-500"
      >
        <div className="h-8 w-8" />
        About
      </Link>
      <Link
        href="https://transitmatters.org/join"
        className="flex flex-row items-center gap-2 text-white hover:text-blue-500"
      >
        <div className="h-8 w-8" />
        Join Us
      </Link>
      <Link
        href="https://forms.gle/SKYtxgKSyCrYxM1v7"
        className="flex flex-row items-center gap-2 text-white hover:text-blue-500"
      >
        <div className="h-8 w-8" />
        Feedback
      </Link>
      <Link
        href="https://github.com/transitmatters/t-performance-dash"
        className="flex flex-row items-center gap-2 text-white hover:text-blue-500"
      >
        <div className="h-8 w-8" />
        Source Code
      </Link>
      <Link
        href="/opensource"
        className="flex flex-row items-center gap-2 text-white hover:text-blue-500"
      >
        <div className="h-8 w-8" />
        Attributions
      </Link>
      <hr className="border-stone-600" />

      <DonateButton />
    </div>
  );
};
