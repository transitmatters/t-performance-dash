'use client';
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Link href="/RL">
        <div>
          <p>Red Line</p>
        </div>
      </Link>
      <Link href="/OL">
        <div>
          <p>Orange Line</p>
        </div>
      </Link>
      <Link href="/GL">
        <div>
          <p>Green Line</p>
        </div>
      </Link>
      <Link href="/BL">
        <div>
          <p>Blue Line</p>
        </div>
      </Link>
    </>
  );
}
