import React from 'react';
import classNames from 'classnames';
import { NavBarButtonProps } from '../navigation/NavBarButton';

export const MobileMenuButton: React.FC<NavBarButtonProps> = ({ value }) => {
  return (
    <a
      className={classNames(
        'flex select-none items-center gap-x-2 border-b-2 border-transparent px-1 text-base text-white'
      )}
    >
      <value.icon className="h-5 w-auto" />
      {value.name}
    </a>
  );
};
