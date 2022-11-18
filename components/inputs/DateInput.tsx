import React from 'react';
import { DateOption } from '../../types/inputs';
import { formatDate } from '../utils/Date';

interface DateInputProps {
  dateSelection: DateOption | null;
  setDateSelection: (dateSelection: DateOption | null) => void;
}

// TODO: add all logic from existing date picker.
export const DateInput: React.FC<DateInputProps> = ({ dateSelection, setDateSelection }) => {
  return (
    <div className="flex flex-row">
      <label className="block text-sm font-medium text-gray-700">{'Date'}</label>

      <input
        type="date"
        className=""
        onChange={(event) =>
          setDateSelection({
            ...dateSelection,
            startDate: event.target.value,
          })
        }
        max={formatDate(new Date())}
      />
      {/* TODO: Dynamically set the color based on the selected line */}
      {dateSelection?.range ? (
        <span className="flex flex-row">
          <label className="block text-sm font-medium text-gray-700">{'To'}</label>
          <span>
            <input
              type="date"
              className=""
              onChange={(event) => {
                setDateSelection({ ...dateSelection, endDate: event.target.value });
              }}
              max={formatDate(new Date())}
            />
            <button
              onClick={() =>
                setDateSelection({ ...dateSelection, endDate: undefined, range: false })
              }
            >
              🅧
            </button>
          </span>
        </span>
      ) : (
        <button
          className="rounded border border-mbta-red bg-transparent py-2 px-4 font-medium text-gray-700 hover:border-transparent hover:bg-mbta-red hover:text-white"
          onClick={() => setDateSelection({ ...dateSelection, range: true })}
        >
          Range...
        </button>
      )}
    </div>
  );
};
