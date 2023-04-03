import React from 'react';
import { DateSelection } from '../../../common/components/inputs/DateSelection/DateSelection';

export const BottomNavBar: React.FC = () => {
  return (
    <div className="pb-safe fixed bottom-0 z-20 w-full bg-white">
      <DateSelection />
    </div>
  );
};
