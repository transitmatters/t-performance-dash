import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { MenuDropdown } from './MenuDropdown';
import { TheRideDropdown } from './TheRideDropdown';

interface TheRideSectionProps {
  close?: () => void;
}

export const TheRideSection: React.FC<TheRideSectionProps> = ({ close }) => {
  const route = useDelimitatedRoute();

  return (
    <div className="flex w-full flex-col gap-y-1">
      <MenuDropdown line="line-RIDE" route={route}>
        <TheRideDropdown line="line-RIDE" close={close} />
      </MenuDropdown>
    </div>
  );
};
