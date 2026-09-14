import classNames from 'classnames';
import React from 'react';

export interface WidgetTextProps {
  text: string;
  isLarge?: boolean;
}
export const WidgetText: React.FC<WidgetTextProps> = ({ text, isLarge = false }) => {
  return (
    <span className={classNames('text-card-foreground', isLarge ? 'text-2xl' : 'text-sm')}>
      {text}
    </span>
  );
};
