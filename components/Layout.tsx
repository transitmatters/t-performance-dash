import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main>{children}</main>
    </div>
  );
};
