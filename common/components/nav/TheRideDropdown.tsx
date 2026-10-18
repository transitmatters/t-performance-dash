import classNames from 'classnames';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { LINE_PAGES } from '../../constants/pages';
import { lineColorBorder } from '../../styles/general';
import type { Line } from '../../types/lines';

interface TheRideDropdownProps {
  line: Line;
  close?: () => void;
}

export const TheRideDropdown: React.FC<TheRideDropdownProps> = ({ line, close }) => {
  const router = useRouter();
  // Only redirect if line is 'line-RIDE' and not already on ridership page
  useEffect(() => {
    if (line === 'line-RIDE' && !router.asPath.includes('/ridership')) {
      router.replace('/the-ride/ridership');
    }
  }, [line, router]);

  return (
    <div
      className={classNames(
        'flex flex-col gap-[2px] rounded-b-md border border-opacity-50 bg-neutral-800 px-1 py-[4px]',
        lineColorBorder[line ?? 'DEFAULT']
      )}
      role={'navigation'}
    >
      <SidebarTabs tabs={LINE_PAGES.filter((cur) => cur.lines.includes(line))} close={close} />
    </div>
  );
};
