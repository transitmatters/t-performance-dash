import React from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/light.css';

const ua = window.navigator.userAgent;
const isMobile = /Android|webOS|iPhone|iPad|BlackBerry|IEMobile|Opera Mini/i.test(ua);
const useFlatPickr = !isMobile;

interface DateInputProps {
  options: { maxDate: string; minDate: string };
  value: string;
  placeholder: string;
  onChange: (value: any) => void;
}

const RegularDateInput: React.FC<DateInputProps> = ({
  options,
  value,
  placeholder,
  onChange
}) => {
  let maxDate = options.maxDate;
  if (maxDate === 'today') {
    const iso_date = new Date();
    const offset = iso_date.getTimezoneOffset();
    const local_date = new Date(iso_date.valueOf() - offset * 60 * 1000);
    maxDate = local_date.toISOString().split('T')[0];
  }
  return (
    <input
      type="date"
      value={value}
      onChange={(evt) => onChange(evt.target.value)}
      placeholder={placeholder}
      min={options.minDate}
      max={maxDate}
    />
  );
};

const FlatpickrDateSelect: React.FC<DateInputProps> = ({
  value,
  placeholder,
  onChange,
  options,
}) => {
  return (
    <Flatpickr
      key={options.maxDate}
      value={value}
      placeholder={placeholder}
      options={{ enableTime: false, ...options }}
      onChange={(dates, currentDateString) => {
        if(currentDateString !== value) {
          onChange(currentDateString);
        }
      }}
    />
  );
};

export const DatePicker: React.FC<DateInputProps> = (props) => {
  if (useFlatPickr) {
    return <FlatpickrDateSelect {...props} />;
  } else {
    return <RegularDateInput {...props} />;
  }
};
