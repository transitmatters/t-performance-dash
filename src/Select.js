import React, { useRef } from "react";
import classNames from 'classnames';

const Select = props => {
    const { options, optionComparator, onChange, defaultLabel = "", value, className } = props;
    const elementRef = useRef(null);

    const handleChange = (evt) => {
        const option = options[evt.target.value];
        onChange(option && option.value);
    }

    const matchingIndex = options.findIndex(optionComparator || (o => o.value === value));

    return (
        <div className={classNames('select-component', className, options.length === 0 && 'disabled')}>
            <select
                ref={elementRef}
                onChange={handleChange}
                value={matchingIndex === -1 ? "default" : matchingIndex}
            >
                <option value="default" disabled hidden>{defaultLabel}</option>
                {options.map((option, index) =>
                    <option
                        value={index}
                        key={index}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                )}
            </select>
        </div>
    );
}

export default Select;