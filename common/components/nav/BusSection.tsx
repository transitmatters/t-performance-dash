import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { BusDropdown } from './BusDropdown';
import { MenuDropdown } from './MenuDropdown';

interface BusSectionProps {
  close?: (
    focusableElement?:
      | HTMLElement
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.MutableRefObject<HTMLElement | null>
      | undefined
  ) => void;
}

export const BusSection: React.FC<BusSectionProps> = ({ close }) => {
  const route = useDelimitatedRoute();
  return (
    <div className="w-full gap-y-2">
      <MenuDropdown line="line-bus" route={route}>
        <BusDropdown close={close} />
      </MenuDropdown>
    </div>
  );
};
