import React, { useCallback, useMemo } from 'react';
import { isMobile } from 'react-device-detect';
import classNames from 'classnames';
import { PageWrapper } from '../../common/layouts/PageWrapper';
import { Layout } from '../../common/layouts/layoutTypes';
import HeroSVG from '../../public/hero.svg';
import LandingTitleSVG from '../../public/landingTitle.svg';
import { useViewport } from '../../common/hooks/useViewport';

export function Landing() {
  const { viewportHeight, viewportWidth } = useViewport();

  const imageHeight = useMemo(() => {
    const smallerDimension = viewportHeight
      ? Math.min(viewportHeight, viewportWidth)
      : viewportWidth;
    if (isMobile) {
      return smallerDimension! * 0.4;
    }
    return smallerDimension! * 0.45;
  }, [viewportHeight, viewportWidth]);

  const handleScrollToDetails = useCallback(() => {
    document.getElementById('charts')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <PageWrapper pageTitle="TransitMatters Dashboard">
      <div
        className={classNames(
          isMobile && 'pb-32',
          'flex h-screen w-full flex-col items-center justify-center gap-4 bg-tm-lightGrey'
        )}
      >
        <div className="flex w-full flex-col items-center gap-8 sm:w-[320px] md:w-[400px] lg:w-[560px]">
          <LandingTitleSVG style={{ height: imageHeight * 0.4 }} />
          <HeroSVG style={{ height: imageHeight }} />
        </div>
        <h2 className="w-full px-8 text-center text-lg text-white">
          This is a subtitle. And this is additional subtitle text that will say some more stuff.
        </h2>
        <button
          className="rounded-md border border-stone-100 px-8 text-xl italic text-white"
          onClick={handleScrollToDetails}
        >
          Let's Go
        </button>
      </div>
      <div className="h-screen bg-tm-lightGrey" id="charts">
        <p className="text-white">System Charts will be here.</p>
      </div>
    </PageWrapper>
  );
}

Landing.Layout = Layout.Landing;
