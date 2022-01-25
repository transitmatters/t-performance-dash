import React from "react";
import classNames from 'classnames';

const RadioForm = (props) => {
  const { options, onChange, checked, className } = props;

  return (
    <div className={classNames("control", className)}>
      {options.map((opt, index) => 
        <label key={index}>
          <input type="radio"
            value={opt.value}
            onChange={evt => onChange(evt.target.value)}
            checked={opt.value === checked}/>
          {opt.label}
        </label>
        )}
    </div>
  )
}

export default RadioForm;