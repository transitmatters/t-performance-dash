import React from 'react';

export interface WidgetTextProps {
  text: string;
}
export const WidgetText: React.FC<WidgetTextProps> = ({ text }) => {
  return <span className="text-2xl font-semibold text-gray-900">{text}</span>;
};
