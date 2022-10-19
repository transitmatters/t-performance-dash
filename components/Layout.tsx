import { Navbar } from './Navbar';
import React from 'react';

export const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};
