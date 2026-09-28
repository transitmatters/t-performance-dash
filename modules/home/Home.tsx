import React from 'react';
import Link from 'next/link';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/components/ui/card';
import { Skeleton } from '../../common/components/ui/skeleton';
import { LINE_OBJECTS } from '../../common/constants/lines';
import { Callouts } from './components/Callouts';
import { HomeHero } from './components/HomeHero';
import { Scoreboard } from './components/Scoreboard';
import { StatusLegend } from './components/StatusLegend';
import { useHomeData } from './useHomeData';

const HomeSkeleton = () => (
  <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-1.5 w-full rounded-full" />
    <Skeleton className="h-10 w-72" />
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-28 rounded-xl" />
      ))}
    </div>
    <Skeleton className="h-96 rounded-xl" />
  </div>
);

/** Without the data, still get people to their line. */
const HomeUnavailable = () => (
  <Card>
    <CardHeader>
      <CardTitle>The system summary isn't available right now</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col gap-3 text-sm">
      <p className="text-muted-foreground">Every line's own pages are still up to date.</p>
      <ul className="flex flex-wrap gap-2">
        {Object.values(LINE_OBJECTS).map((line) => (
          <li key={line.key}>
            <Link
              href={`/${line.path}`}
              className="bg-muted rounded-md px-2.5 py-1 hover:underline"
            >
              {line.name}
            </Link>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

export function Home() {
  const { data, isLoading, isError } = useHomeData();

  return (
    <PageWrapper pageTitle="Home">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        {data ? (
          <>
            <HomeHero stats={data.hero} generatedAt={data.generatedAt} />
            <Callouts data={data} />
            <Scoreboard rows={data.rows} />
            <StatusLegend />
          </>
        ) : isLoading && !isError ? (
          <HomeSkeleton />
        ) : (
          <HomeUnavailable />
        )}
      </div>
    </PageWrapper>
  );
}

Home.Layout = Layout.Landing;
