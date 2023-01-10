import React, { useState } from 'react';

import { LineSelector } from '../Dropdowns/LineSelector';

interface BottomNavBarProps {
  line: string;
  section: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ line, section }) => {
  const [dropdown, setDropdown] = useState('none');

  return (
    <div className="fixed bottom-0 flex h-10 w-full flex-row items-center bg-white">
      <LineSelector selectedLine={'RL'} />
      <p className="ml-2 select-none font-bold">{section}</p>
    </div>
  );
};
