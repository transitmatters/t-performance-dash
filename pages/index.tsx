'use client';
import React from 'react';
import Link from 'next/link';
export default function Home() {
  return (
    <>
      <Link href="/red">
        <div>
          <p>Red Line</p>
        </div>
      </Link>
      <Link href="/orange">
        <div>
          <p>Orange Line</p>
        </div>
      </Link>
      <Link href="/green">
        <div>
          <p>Green Line</p>
        </div>
      </Link>
      <Link href="/blue">
        <div>
          <p>Blue Line</p>
        </div>
      </Link>
    </>
  );
}
