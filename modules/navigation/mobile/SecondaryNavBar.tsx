import React from 'react';
import { DateSelection } from '../../../common/components/inputs/DateSelection/DateSelection';

export const SecondaryNavBar: React.FC = () => {
  return (
    <div className="pb-safe fixed bottom-11 z-20 w-full bg-white">
      <DateSelection />
    </div>
  );
};
