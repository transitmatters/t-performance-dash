import React from 'react';
import { Navbar } from './Navbar';

export const Layout = ({ children }) => {
  return (
    <div className="flex flex-col">
      <Navbar />
      <main className="relative top-11 sm:top-16">{children}</main>
    </div>
  );
};
