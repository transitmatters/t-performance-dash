import React from 'react';

interface LandingLayoutProps {
  children: React.ReactNode;
}

export const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-1 flex-col md:pl-64">
      <main className="flex-1">{children}</main>
    </div>
  );
};
