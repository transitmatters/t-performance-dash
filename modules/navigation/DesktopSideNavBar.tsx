import React, { Fragment } from 'react';

import Link from 'next/link';
import classNames from 'classnames';
import TmLogoSvg from '../../public/tm-logo-big.svg';
import { DonateButton } from '../../common/components/buttons/DonateButton';
import { FeedbackButton } from '../../common/components/buttons/FeedbackButton';
import { SideNavigation } from './SideNavigation';

interface SideNavBarProps {
  isLanding?: boolean;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({ isLanding = false }) => {
  return (
    <>
      <div className="bg-tm-grey text-gray-300">
        <div className="fixed inset-y-0 flex w-64 flex-col overflow-y-hidden bg-tm-grey">
          <div className="sticky flex flex-shrink-0 px-6 pb-2 pt-5">
            <Link href="/" className="h-full w-full">
              <TmLogoSvg alt="TransitMatters Logo" />
            </Link>
          </div>
          <div className="relative flex flex-grow flex-col overflow-y-auto pb-4">
            <div className="fixed h-5 w-64 bg-gradient-to-b from-tm-grey to-transparent"></div>
            <SideNavigation isLanding={isLanding} />
            <div
              className={classNames(
                isLanding ? 'bottom-48' : 'bottom-24',
                'fixed h-5 w-64 bg-gradient-to-t from-tm-grey to-transparent'
              )}
            ></div>
          </div>
          <div className="flex flex-col gap-2 px-4 py-2">
            {isLanding ? (
              <>
                <Link href="https://transitmatters.org/join">
                  <p>Subscribe</p>
                </Link>
                <p>Metrics</p>
                <Link href="https://transitmatters.org/about/mission">About Us</Link>
                <Link href="/">Feedback</Link>
              </>
            ) : (
              <FeedbackButton />
            )}
            <DonateButton />
          </div>
        </div>
      </div>
    </>
  );
};
