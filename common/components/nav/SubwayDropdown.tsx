import classNames from 'classnames';
import React from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { OVERVIEW_PAGE, LINE_PAGES, TRIP_PAGES } from '../../constants/pages';
import { lineColorBorder } from '../../styles/general';
import type { Line } from '../../types/lines';

interface SubwayDropdownProps {
  line: Line;
  close?: () => void;
}

export const SubwayDropdown: React.FC<SubwayDropdownProps> = ({ line, close }) => {
  return (
    <div
      className={classNames(
        'flex flex-col gap-[2px] rounded-b-md border border-opacity-50 bg-neutral-800 px-1 py-[4px]',
        lineColorBorder[line ?? 'DEFAULT']
      )}
      role={'navigation'}
    >
      <SidebarTabs tabs={OVERVIEW_PAGE} close={close} />
      <hr className="h-[1px] w-3/4 self-center border-neutral-500" />
      <SidebarTabs tabs={LINE_PAGES.filter((cur) => cur.lines.includes(line))} close={close} />
      <hr className="h-[1px] w-3/4 self-center border-neutral-500" />
      <SidebarTabs tabs={TRIP_PAGES} close={close} />
    </div>
  );
};
