import dayjs from 'dayjs';
import type { SetStateAction } from 'react';
import React, { useState } from 'react';
import Datepicker from 'tailwind-datepicker-react';
import { Button } from '../Button';

interface DatePickerProps {
  range: boolean;
  setRange: React.Dispatch<SetStateAction<boolean>>;
}
const today = dayjs().format('YYYY-MM-DD');

const options = {
  autoHide: true,
  todayBtn: false,
  clearBtn: true,
  maxDate: new Date(today),
  minDate: new Date('2016-01-15'),

  icons: {
    // () => ReactElement | JSX.Element
    prev: () => <span>Previous</span>,
    next: () => <span>Next</span>,
  },
  datepickerClassNames: 'top-12',
  defaultDate: new Date(today),
  language: 'en',
};

export const DatePickers = ({ range, setRange }) => {
  const [showStart, setShowStart] = useState<boolean>(false);
  const [showEnd, setShowEnd] = useState<boolean>(false);
  return (
    <>
      <Datepicker
        options={options}
        onChange={(event) => console.log(event)}
        show={showStart}
        setShow={() => setShowStart(!showStart)}
      />
      {range && (
        <>
          <p>to</p>
          <Datepicker
            options={options}
            onChange={(event) => console.log(event)}
            show={showEnd}
            setShow={() => setShowEnd(!showEnd)}
          />
        </>
      )}
      <Button onClick={() => setRange(!range)}>
        <p>{range ? 'X' : 'Range...'}</p>
      </Button>
    </>
  );
};
