import { faSubway, faTrainSubway, faTrainTram, faTram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Transition } from '@headlessui/react';
import classNames from 'classnames';
import { delay } from 'lodash';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { SidebarTabs } from '../../../modules/navigation/SidebarTabs';
import { LINE_COLORS } from '../../constants/colors';
import { LINE_OBJECTS } from '../../constants/lines';
import { LINE_PAGES, OVERVIEW_PAGE, TRIP_PAGES } from '../../constants/pages';
import { lineColorBackground } from '../../styles/general';
import { Line } from '../../types/lines';
import { Route } from '../../types/router';
import { getLineSelectionItemHref } from '../../utils/router';

interface SubwayDropdownProps {
    line: Line;
    route: Route;
}
const Dropdown: React.FC = ({ }) => {
    return <div className={"flex rounded-b-md bg-neutral-800 flex-col px-1 gap-[2px] py-[2px]"} role={'navigation'}>
        <SidebarTabs tabs={OVERVIEW_PAGE} />
        <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
        <SidebarTabs tabs={LINE_PAGES} />
        <hr className="border-neutral-500 h-[1px] w-3/4 self-center" />
        <SidebarTabs tabs={TRIP_PAGES} />
    </div>
}

export const SubwayDropdown: React.FC<SubwayDropdownProps> = ({ line, route }) => {
    const selected = line === route.line
    const [show, setShow] = useState<boolean>(false)

    // Need a timeout so that the selected and previously selected dropdowns do not render as opened simultaneously.
    useEffect(() => {
        setTimeout(() => setShow(true), 0)
    }, [selected])
    return <div className={classNames('w-full')}>
        <Link href={getLineSelectionItemHref(line, route)} >
            <div className={classNames('w-full px-2 gap-2 flex py-1 items-center flex-row rounded-t-md', selected ? lineColorBackground[line ?? 'DEFAULT'] : '')}>
                <div className={classNames(lineColorBackground[line ?? 'DEFAULT'], "rounded-full flex items-center w-8 h-8 justify-center")}><FontAwesomeIcon icon={line === 'line-green' ? faTrainTram : faTrainSubway} className="h-5 w-5" /></div>
                {LINE_OBJECTS[line].name}
            </div>
        </Link>
        {selected && show && <Dropdown />}
    </div >

}