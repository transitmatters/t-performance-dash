'use client';

import React from 'react';
import { NavBarItem } from '../../constants/NavBarLinks';
import { classNames } from '../utils/tailwind';

export interface NavBarButtonProps {
  value: NavBarItem;
}

export const NavBarButton: React.FC<NavBarButtonProps> = ({ value }) => {
  return (
    <div
      className={classNames(
        'h-full items-center gap-x-2 px-4 text-base text-white hover:border-b',
        'hidden sm:flex'
      )}
    >
      <value.icon className="h-5 w-auto" alt={value.name} />
      <p className="text-center">{value.name}</p>
    </div>
  );
};
