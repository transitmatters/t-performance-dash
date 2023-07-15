import React from 'react';
export interface UnitTextProps {
  text: string;
}
export const UnitText: React.FC<UnitTextProps> = ({ text }) => {
  return <span className="text-sm text-design-subtitleGrey">{text}</span>;
};
