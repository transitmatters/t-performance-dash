import React from 'react';

import ExploreArrow from '../../public/Icons/Components/ExploreArrow.svg';
import { LineSelector } from '../Dropdowns/LineSelector';
import { SectionSelector } from '../Dropdowns/SectionSelector';

interface BottomNavBarProps {
  line: string;
  section: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ line, section }) => {
  return (
    <div className="pb-safe fixed bottom-0 z-20 w-full bg-white">
      <div className="flex h-11 w-full flex-row items-center gap-x-2 bg-white shadow-shadowUp">
        <LineSelector selectedLine={'RL'} />
        <ExploreArrow className="h-3 w-auto sm:h-3" alt="Go" />
        <SectionSelector selectedSection={'Commute'} />
        <ExploreArrow className="relative -left-2 h-3 w-auto sm:h-3" alt="Go" />
      </div>
    </div>
  );
};
