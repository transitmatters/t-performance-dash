import React from 'react';

const CIP_EXPIRY = new Date('2026-05-02T00:00:00');

export const CIPBanner: React.FC = () => {
  if (new Date() >= CIP_EXPIRY) return null;

  return (
    <a
      href="https://secure.everyaction.com/DKcTW8SPr06sCMwjIo44UA2"
      target="_blank"
      rel="noopener noreferrer"
      className="bg-tm-red hover:bg-mbta-darkRed relative z-10 block px-4 py-3 text-center text-sm font-semibold text-white transition-colors md:py-4 md:text-base"
    >
      🚨 The MBTA&apos;s 5-year Capital Investment Plan needs your input — Take action now!
    </a>
  );
};
