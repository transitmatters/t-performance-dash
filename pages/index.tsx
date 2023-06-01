'use client';
import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '../common/layouts/PageWrapper';
import { LayoutType } from '../common/layouts/layoutTypes';
export default function Home() {
  return (
    <PageWrapper>
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
    </PageWrapper>
  );
}

Home.Layout = LayoutType.Landing;
