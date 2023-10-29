import React, { useState } from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { MenuDropdown } from './MenuDropdown';
import { SubwayDropdown } from './SubwayDropdown';
export const SubwaySection: React.FC = () => {
    const route = useDelimitatedRoute();


    return <div className="w-full gap-y-2">
        <MenuDropdown line="line-red" route={route}>
            <SubwayDropdown />
        </MenuDropdown>
        <MenuDropdown line="line-orange" route={route}>
            <SubwayDropdown />
        </MenuDropdown>
        <MenuDropdown line="line-blue" route={route}>
            <SubwayDropdown />
        </MenuDropdown>
        <MenuDropdown line="line-green" route={route}>
            <SubwayDropdown />
        </MenuDropdown>
    </div>

}