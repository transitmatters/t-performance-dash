import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { MenuDropdown } from './MenuDropdown';
import { SubwayDropdown } from './SubwayDropdown';

interface SubwaySectionProps {
  close?: (
    focusableElement?:
      | HTMLElement
      | React.MouseEvent<HTMLElement, MouseEvent>
      | React.MutableRefObject<HTMLElement | null>
      | undefined
  ) => void;
}

export const SubwaySection: React.FC<SubwaySectionProps> = ({ close }) => {
  const route = useDelimitatedRoute();

  return (
    <div className="w-full gap-y-2">
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
