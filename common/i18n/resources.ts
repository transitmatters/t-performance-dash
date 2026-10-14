import commute from '../../locales/en/commute.json';
import common from '../../locales/en/common.json';
import dashboard from '../../locales/en/dashboard.json';
import delays from '../../locales/en/delays.json';
import fleet from '../../locales/en/fleet.json';
import home from '../../locales/en/home.json';
import landing from '../../locales/en/landing.json';
import navigation from '../../locales/en/navigation.json';
import reliability from '../../locales/en/reliability.json';
import ridership from '../../locales/en/ridership.json';
import service from '../../locales/en/service.json';
import serviceAndRidership from '../../locales/en/serviceAndRidership.json';
import weather from '../../locales/en/weather.json';

// English is the source language: its catalogs are bundled so i18n initialises synchronously
// (in the browser, vitest, Storybook and the build-time meta-tag prerender alike).
// Register each new namespace (locales/en/<namespace>.json) here.
export const defaultNS = 'common';

export const resources = {
  en: {
    common,
    commute,
    dashboard,
    delays,
    fleet,
    home,
    landing,
    navigation,
    reliability,
    ridership,
    service,
    serviceAndRidership,
    weather,
  },
};
