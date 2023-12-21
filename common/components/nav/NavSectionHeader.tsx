import React from 'react';

interface NavSectionHeaderProps {
  title: string;
}

export const NavSectionHeader: React.FC<NavSectionHeaderProps> = ({ title }) => {
  return <h3 className="text-xs italic text-stone-300">{title}</h3>;
};
