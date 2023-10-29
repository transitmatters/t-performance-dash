import React, { useState } from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { MenuDropdown } from './MenuDropdown';
import { SubwayDropdown } from './SubwayDropdown';
export const SubwaySection: React.FC = () => {
    const route = useDelimitatedRoute();


    return <div className="w-full gap-y-2">
        <MenuDropdown line="line-red" route={route}>
            <SubwayDropdown line="line-red" />
        </MenuDropdown>
        <MenuDropdown line="line-orange" route={route}>
            <SubwayDropdown line="line-orange" />
        </MenuDropdown>
        <MenuDropdown line="line-blue" route={route}>
            <SubwayDropdown line="line-blue" />
        </MenuDropdown>
        <MenuDropdown line="line-green" route={route}>
            <SubwayDropdown line="line-green" />
        </MenuDropdown>
    </div>

}