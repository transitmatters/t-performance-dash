import React from 'react';
import type { ServiceDay } from '../../types/ridership';
import { RadioList } from './RadioList';

interface ServiceDayPickerProps {
  serviceDay: ServiceDay;
  setServiceDay: (serviceDay: ServiceDay) => void;
}

export const ServiceDayPicker: React.FC<ServiceDayPickerProps> = ({
  serviceDay,
  setServiceDay,
}) => {
  const options: { value: ServiceDay; label: string }[] = [
    { value: 'weekday', label: 'Weekday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  return (
    <div className={'flex w-auto items-center'}>
      <RadioList
        legendText={'Service Day for Ridership'}
        options={options}
        defaultValue="weekday"
        value={serviceDay}
        setValue={setServiceDay}
      />
    </div>
  );
};
