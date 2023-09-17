import classNames from 'classnames';
import React from 'react';
export interface UnitTextProps {
  text: string;
  isLarge?: boolean;
}
export const UnitText: React.FC<UnitTextProps> = ({ text, isLarge = false }) => {
  return (
    <span className={classNames('text-design-subtitleGrey', isLarge ? 'text-md' : 'text-md')}>
      {text}
    </span>
  );
};
