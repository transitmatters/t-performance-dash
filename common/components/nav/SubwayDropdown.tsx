import classNames from 'classnames';
import React, { SetStateAction } from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { OVERVIEW_PAGE, LINE_PAGES, TRIP_PAGES } from '../../constants/pages';
import { lineColorBorder } from '../../styles/general';
import { Line } from '../../types/lines';

interface SubwayDropdownProps {
    line: Line
    close?: (focusableElement?: HTMLElement | React.MouseEvent<HTMLElement, MouseEvent> | React.MutableRefObject<HTMLElement | null> | undefined) => void
}

export const SubwayDropdown: React.FC<SubwayDropdownProps> = ({ line, close }) => {
    return <div className={classNames("flex rounded-b-md bg-neutral-800 flex-col px-1 gap-[2px] py-[4px] border border-opacity-50", lineColorBorder[line ?? 'DEFAULT'])} role={'navigation'}>
        <SidebarTabs tabs={OVERVIEW_PAGE} close={close} />
        <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
        <SidebarTabs tabs={LINE_PAGES} close={close} />
        <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
        <SidebarTabs tabs={TRIP_PAGES} close={close} />
    </div>
}