import React, { useState } from 'react';
import { useDelimitatedRoute } from '../../utils/router';
import { SubwayDropdown } from './SubwayDropdown';
export const SubwaySection: React.FC = () => {
    const route = useDelimitatedRoute();


    return <div className="w-full gap-y-2">
        <SubwayDropdown line="line-red" route={route} />
        <SubwayDropdown line="line-orange" route={route} />
        <SubwayDropdown line="line-blue" route={route} />
        <SubwayDropdown line="line-green" route={route} />
    </div>

}