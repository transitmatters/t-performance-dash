import classNames from 'classnames';
import React from 'react';

export interface WidgetTextProps {
  text: string;
  light?: boolean;
}
export const WidgetText: React.FC<WidgetTextProps> = ({ text, light }) => {
  return (
    <span
      className={classNames(light ? 'text-stone-100' : 'text-stone-900', 'text-base font-semibold')}
    >
      {text}
    </span>
  );
};
