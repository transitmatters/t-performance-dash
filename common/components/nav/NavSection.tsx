import React from 'react';

interface NavSectionProps {
  title: string;
  content: React.ReactNode;
}

export const NavSection: React.FC<NavSectionProps> = ({ title, content }) => {
  return <div>{content}</div>;
};
