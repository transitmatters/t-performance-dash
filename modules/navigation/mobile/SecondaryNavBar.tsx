import React from 'react';
import { DateSelection } from '../../../common/components/inputs/DateSelection/DateSelection';

export const SecondaryNavBar: React.FC = () => {
  return (
    <div className="z-20 w-full bg-gray-100">
      <DateSelection range />
    </div>
  );
};
