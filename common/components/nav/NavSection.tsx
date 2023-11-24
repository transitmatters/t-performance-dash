import React from 'react';
import { NavSectionHeader } from './NavSectionHeader';

interface NavSectionProps {
  title: string;
  content: React.ReactNode;
}

export const NavSection: React.FC<NavSectionProps> = ({ title, content }) => {
  return (
    <div className="mt-1">
      <NavSectionHeader title={title} />
      <div>{content}</div>
    </div>
  );
};
