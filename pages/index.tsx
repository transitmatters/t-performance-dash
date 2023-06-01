'use client';
import React from 'react';
import { PageWrapper } from '../common/layouts/PageWrapper';
import { LayoutType } from '../common/layouts/layoutTypes';
export default function Home() {
  return (
    <PageWrapper>
      <div className="flex h-full w-full items-center justify-center">
        <h1 className="text-7xl">Landing Page!</h1>
      </div>
    </PageWrapper>
  );
}

Home.Layout = LayoutType.Landing;
