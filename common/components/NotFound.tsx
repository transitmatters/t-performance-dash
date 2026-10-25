import type { FC } from 'react';
import { LandingLayout } from '../layouts/LandingLayout';
import { Link } from './general/Link';

export const NotFound: FC = () => (
  <LandingLayout>
    <div className="h-screen w-full">
      <title>Data Dashboard - 404</title>
      <div className="flex h-full w-full flex-col items-center gap-4 bg-tm-lightGrey pt-20">
        <h1 className="text-xl text-white lg:text-5xl">Sorry, we can't find that page</h1>
        <Link href="/">
          <p className="text-blue-500">Return to home</p>
        </Link>
      </div>
    </div>
  </LandingLayout>
);
