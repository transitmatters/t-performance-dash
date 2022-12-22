import React from 'react';
import { DateOption } from '../../types/inputs';
import { formatDate } from '../utils/Date';

interface DateInputProps {
  dateSelection: DateOption;
  setDateSelection: (dateSelection: DateOption) => void;
}

// TODO: add all logic from existing date picker.
export const DateInput: React.FC<DateInputProps> = ({ dateSelection, setDateSelection }) => {
  return (
    <div className="flex flex-row">
      <label className="block text-sm font-medium text-gray-700">{'Date'}</label>

      <input
        type="date"
        className=""
        onChange={(event) => setDateSelection({ ...dateSelection, startDate: event.target.value })}
        max={formatDate(new Date())}
      />
      {/* TODO: Dynamically set the color based on the selected line */}
      {
        dateSelection?.range ? (
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
        )
        //x button
      }
    </div>

    // <div className="option option-date">
    //     <span className="date-label">Date</span>
    //     <DatePicker
    //         value={this.getVal('date_start') || ''}
    //         onChange={this.handleSelectOption('date_start')}
    //         options={availableDates}
    //         placeholder="Select date..."
    //     />
    //     <button
    //         className="more-options-button"
    //         style={this.state.show_date_end_picker ? { display: 'none' } : {}}
    //         onClick={() => this.setState({ show_date_end_picker: true })}
    //     >
    //         Range...
    //     </button>
    //     {!!this.state.show_date_end_picker && (
    //         <>
    //             <span className="date-label end-date-label">to</span>
    //             <DatePicker
    //                 value={this.getVal('date_end') || ''}
    //                 onChange={this.handleSelectOption('date_end')}
    //                 options={availableDates}
    //                 placeholder="Select date..."
    //             />
    //             <button
    //                 className="clear-button"
    //                 style={{ visibility: this.state.show_date_end_picker ? 'visible' : 'hidden' }}
    //                 onClick={this.clearMoreOptions}
    //             >
    //                 🅧
    //             </button>
    //         </>
    //     )}
    // </div>
  );
};
