import { LandingLayout } from '../layouts/LandingLayout';
import { Link } from './general/Link';

export const NotFound = () => (
  <LandingLayout>
    <div className="h-screen w-full">
      <title>Page not found | Data Dashboard</title>
      <div className="flex h-full w-full flex-col items-center gap-4 bg-tm-lightGrey pt-20">
        <h1 className="text-xl font-bold text-white">Sorry, we can't find that page</h1>
        <Link href="/">
          <p className="text-blue-500">Return to home</p>
        </Link>
      </div>
    </div>
  </LandingLayout>
);
