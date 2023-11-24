import { faTrainSubway, faTrainTram } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { LINE_OBJECTS } from '../../constants/lines';
import { BUS_DEFAULTS } from '../../state/defaults/dateDefaults';
import { lineColorBackground, lineColorBackgroundHover } from '../../styles/general';
import { Line } from '../../types/lines';
import { Route } from '../../types/router';
import { getLineSelectionItemHref } from '../../utils/router';

interface MenuDropdownProps {
    line: Line;
    route: Route;
    children: React.ReactNode;
}

export const MenuDropdown: React.FC<MenuDropdownProps> = ({ line, route, children }) => {
    const selected = line === route.line
    const [show, setShow] = useState<boolean>(false)

    // Need a timeout so that the selected and previously selected dropdowns do not render as opened simultaneously.
    useEffect(() => {
        setTimeout(() => setShow(true), 0)
    }, [selected])
    return <div className={classNames('w-full')}>
        <Link href={line === 'line-bus' ? `/bus/trips/single?busRoute=1&date=${BUS_DEFAULTS.singleTripConfig.date}` : getLineSelectionItemHref(line, route)} >
            <div className={classNames('w-full gap-2 flex py-1 items-center text-sm flex-row rounded-t-md ', `${lineColorBackground[line ?? 'DEFAULT']}`, selected ? `bg-opacity-100 text-white text-opacity-95` : `hover:bg-opacity-30 bg-opacity-0 hover:rounded-md`)}>
                <div className={classNames(lineColorBackground[line ?? 'DEFAULT'], "rounded-full flex items-center w-8 h-8 justify-center bg-opacity-75")}>
                    {/* TODO: add bus icon */}
                    <FontAwesomeIcon icon={line === 'line-green' ? faTrainTram : faTrainSubway} size="lg" />
                </div>
                {LINE_OBJECTS[line].name}
            </div>
        </Link>
        {selected && show && children}
    </div >

}