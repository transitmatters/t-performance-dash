import React, { useCallback } from 'react';
import { isMobile } from 'react-device-detect';
import Lottie from 'react-lottie-player';
import Image from 'next/image';

import classNames from 'classnames';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import HeroLottie from '../../public/Animations/hero.lottie.json';
import { useBreakpoint } from '../../common/hooks/useBreakpoint';
import { LandingCharts } from './LandingCharts';
import { LineSelectionLanding } from './LineSelectionLanding';

export function Landing() {
  const md = useBreakpoint('md');
  const handleScrollToDetails = useCallback(() => {
    document.getElementById('charts')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <PageWrapper pageTitle="Home">
      <div
        className={classNames(
          isMobile && 'pb-32',
          'relative flex h-screen w-full flex-col items-center justify-center gap-4 overflow-x-hidden overflow-y-visible bg-stone-100'
        )}
      >
        <div className="relative z-10 flex w-5/6 flex-col items-center gap-y-4 rounded-lg bg-stone-900 bg-opacity-60 px-4 py-8 backdrop-blur-sm md:p-8 md:py-12 lg:w-3/4 2xl:w-1/2">
          <Image
            src="/Logo_wordmark_white.png"
            className="w-[12rem] sm:w-[15rem] xl:w-[20rem]"
            width="3204"
            height="301"
            alt="TransitMatters"
          />
          <h1 className="text-center text-3xl font-bold uppercase italic text-stone-100 sm:text-5xl lg:text-6xl">
            Data Dashboard
          </h1>
          <h2 className="w-3/4 text-center text-lg text-white lg:px-8">
            See how your transit line is doing at a glance, or explore MBTA performance trends.
          </h2>
          <button
            className="rounded-md border-2 border-stone-100 px-8 py-2 text-xl font-bold italic text-stone-100 hover:bg-stone-100 hover:text-stone-700"
            onClick={handleScrollToDetails}
          >
            LET'S GO
          </button>
        </div>
      </div>
      <div
        className="relative z-10 h-full bg-stone-100 bg-opacity-80 pb-20 pt-12 backdrop-blur-lg md:py-20"
        id="charts"
      >
        <LandingCharts />
        <LineSelectionLanding />
      </div>
      <div
        className="fixed left-1/2 top-1/2  z-0 -translate-x-1/2 -translate-y-1/2"
        style={{ height: md ? '100vh' : '140vw', width: md ? '100vh' : '140vw' }}
      >
        <Lottie loop animationData={HeroLottie} play style={{}} />
      </div>
    </PageWrapper>
  );
}

Landing.Layout = Layout.Landing;
