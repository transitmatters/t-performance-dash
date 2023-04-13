import React from 'react';
import type { ServiceDay } from '../../types/ridership';
import { ButtonGroup } from '../general/ButtonGroup';

interface ServiceDayPickerProps {
  setServiceDay: (serviceDay: ServiceDay) => void;
}

export const ServiceDayPicker: React.FC<ServiceDayPickerProps> = ({ setServiceDay }) => {
  const options: { [key in ServiceDay]: string } = {
    weekday: 'Weekday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  };
  // const test = Object.entries<ServiceDay>(options);
  return (
    <div className={'flex w-full justify-center pt-2'}>
      <ButtonGroup
        options={Object.entries(options)}
        pressFunction={(value: ServiceDay) => setServiceDay(value)}
      />
    </div>
  );
};
