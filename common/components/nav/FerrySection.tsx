import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { MenuDropdown } from './MenuDropdown';
import { FerryDropdown } from './FerryDropdown';

interface FerrySectionProps {
  close?: () => void;
}

export const FerrySection: React.FC<FerrySectionProps> = ({ close }) => {
  const route = useDelimitatedRoute();
  return (
    <div className="w-full gap-y-2">
      <MenuDropdown line="line-ferry" route={route}>
        <FerryDropdown close={close} />
      </MenuDropdown>
    </div>
  );
};
