import React, { useState } from 'react';
import { Listbox } from '@headlessui/react';
import { DateOption, SelectOption } from '../../types/inputs';
import { formatDate } from '../utils/Date';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}

interface DateInputProps {
    dateSelection: DateOption | null;
    setDateSelection: (dateSelection: DateOption | null) => void;
};

// TODO: add all logic from existing date picker.
export const DateInput: React.FC<DateInputProps> = ({ dateSelection, setDateSelection }) => {
    return (
        <div className="flex flex-row">
            <label className="block text-sm font-medium text-gray-700">{'Date'}</label>

            <input type="date" className="" onChange={(event) => setDateSelection({...dateSelection, startDate: event.target.value})} max={formatDate(new Date())}/>
            {/* TODO: Dynamically set the color based on the selected line */}
            {dateSelection?.range ?
                <span className="flex flex-row">
                    <label className="block text-sm font-medium text-gray-700">{'To'}</label>
                    <span>
                        <input type="date" className="" onChange={(event) => {setDateSelection({...dateSelection, endDate: event.target.value})}} max={formatDate(new Date())}/>
                        <button onClick={() => setDateSelection({ ...dateSelection, range: false })}>🅧</button>
                    </span>
                </span>
                :
                <button className='bg-transparent hover:bg-mbta-red text-gray-700 font-medium hover:text-white py-2 px-4 border border-mbta-red hover:border-transparent rounded'
                        onClick={() => setDateSelection({ ...dateSelection, range: true })}>
                    Range...
                </button>
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
}