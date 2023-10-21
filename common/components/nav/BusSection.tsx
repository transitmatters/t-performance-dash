import React, { useState } from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { SubwayDropdown } from './SubwayDropdown';
export const BusSection: React.FC = () => {
    const route = useDelimitatedRoute();


    return <div className="w-full gap-y-2">
        <SubwayDropdown line="line-bus" route={route} />
    </div>

}