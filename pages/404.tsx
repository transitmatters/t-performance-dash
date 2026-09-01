import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import { Layout } from '../common/layouts/layoutTypes';

export default function Page() {
  return (
    <div className="h-screen w-full">
      <Head>
        <title>Data Dashboard - 404</title>
      </Head>
      <div className="bg-tm-lightGrey flex h-full w-full flex-col items-center gap-4 pt-20">
        <h1 className="text-xl text-white lg:text-5xl">Sorry, we can't find that page</h1>
        <Link href="/">
          <p className="text-blue-500">Return to home</p>
        </Link>
      </div>
    </div>
  );
}

Page.Layout = Layout.Landing;
