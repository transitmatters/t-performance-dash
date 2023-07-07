import React from 'react';
export interface UnitTextProps {
  text: string;
}
export const UnitText: React.FC<UnitTextProps> = ({ text }) => {
  return <span className="text-base text-design-subtitleGrey">{text}</span>;
};
