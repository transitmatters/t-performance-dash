import React from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { BusDropdown } from './BusDropdown';
import { MenuDropdown } from './MenuDropdown';
export const BusSection: React.FC = () => {
    const route = useDelimitatedRoute();
    return <div className="w-full gap-y-2">
        <MenuDropdown line="line-bus" route={route}>
            <BusDropdown />
        </MenuDropdown>
    </div>

}