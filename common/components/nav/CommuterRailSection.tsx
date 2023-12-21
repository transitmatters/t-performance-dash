import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { MenuDropdown } from './MenuDropdown';
import { CommuterRailDropdown } from './CommuterRailDropdown';

interface CommuterRailSectionProps {
  close?: () => void;
}

export const CommuterRailSection: React.FC<CommuterRailSectionProps> = ({ close }) => {
  const route = useDelimitatedRoute();
  return (
    <div className="w-full gap-y-2">
      <MenuDropdown line="line-commuter-rail" route={route}>
        <CommuterRailDropdown close={close} />
      </MenuDropdown>
    </div>
  );
};
