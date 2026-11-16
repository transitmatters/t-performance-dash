import { PageWrapper } from '../../common/layouts/PageWrapper';
import { DonateCallout } from './components/DonateCallout';
import { HomeTitle } from './components/HomeTitle';
import { Scoreboard } from './components/Scoreboard';
import { Verdict } from './components/Verdict';
import { useHomeData } from './useHomeData';

/** Every part of the page renders straight away from config; the numbers fill in as they load. */
export function Home() {
  const { data, state, retry } = useHomeData();

  return (
    <PageWrapper pageTitle="Home">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <HomeTitle generatedAt={data?.generatedAt} failed={state === 'error'} />
        <Verdict rows={data?.rows} state={state} />
        <Scoreboard rows={data?.rows} state={state} onRetry={retry} />
        <DonateCallout />
      </div>
    </PageWrapper>
  );
}
