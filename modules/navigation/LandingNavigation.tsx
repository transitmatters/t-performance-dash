import Link from 'next/link';
import React from 'react';
export const LandingNavigation = () => {
  return (
    <div className="flex flex-col gap-2">
      <Link href="/red">Red Line</Link>
      <Link href="/orange">Orange Line</Link>
      <Link href="/blue">Blue Line</Link>
      <Link href="/green">Green Line</Link>
      <Link href="/bus">Bus</Link>
    </div>
  );
};
