import classNames from 'classnames';
import React from 'react';
export interface UnitTextProps {
  text: string;
  light?: boolean;
}
export const UnitText: React.FC<UnitTextProps> = ({ text, light }) => {
  return (
    <span className={classNames(light ? 'text-stone-200' : 'text-stone-700', 'text-base ')}>
      {text}
    </span>
  );
};
