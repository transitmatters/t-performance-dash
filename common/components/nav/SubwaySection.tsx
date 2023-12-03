import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { MenuDropdown } from './MenuDropdown';
import { SubwayDropdown } from './SubwayDropdown';

interface SubwaySectionProps {
  close?: () => void;
}

export const SubwaySection: React.FC<SubwaySectionProps> = ({ close }) => {
  const route = useDelimitatedRoute();

  return (
    <div className="flex w-full flex-col gap-y-1">
      <MenuDropdown line="line-red" route={route}>
        <SubwayDropdown line="line-red" close={close} />
      </MenuDropdown>
      <MenuDropdown line="line-orange" route={route}>
        <SubwayDropdown line="line-orange" close={close} />
      </MenuDropdown>
      <MenuDropdown line="line-blue" route={route}>
        <SubwayDropdown line="line-blue" close={close} />
      </MenuDropdown>
      <MenuDropdown line="line-green" route={route}>
        <SubwayDropdown line="line-green" close={close} />
      </MenuDropdown>
    </div>
  );
};
