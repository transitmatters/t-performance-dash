import alerts from '../../locales/en/alerts.json';
import busspeedmap from '../../locales/en/busspeedmap.json';
import common from '../../locales/en/common.json';
import commute from '../../locales/en/commute.json';
import dashboard from '../../locales/en/dashboard.json';
import delays from '../../locales/en/delays.json';
import dwells from '../../locales/en/dwells.json';
import fleet from '../../locales/en/fleet.json';
import headways from '../../locales/en/headways.json';
import home from '../../locales/en/home.json';
import landing from '../../locales/en/landing.json';
import navigation from '../../locales/en/navigation.json';
import predictions from '../../locales/en/predictions.json';
import reliability from '../../locales/en/reliability.json';
import ridership from '../../locales/en/ridership.json';
import service from '../../locales/en/service.json';
import serviceAndRidership from '../../locales/en/serviceAndRidership.json';
import slowzones from '../../locales/en/slowzones.json';
import speed from '../../locales/en/speed.json';
import traveltimes from '../../locales/en/traveltimes.json';
import tripexplorer from '../../locales/en/tripexplorer.json';
import weather from '../../locales/en/weather.json';

// English is the source language: its catalogs are bundled so i18n initialises synchronously
// (in the browser, vitest, Storybook and the build-time meta-tag prerender alike).
// Register each new namespace (locales/en/<namespace>.json) here.
export const defaultNS = 'common';

export const resources = {
  en: {
    alerts,
    busspeedmap,
    common,
    commute,
    dashboard,
    delays,
    dwells,
    fleet,
    headways,
    home,
    landing,
    navigation,
    predictions,
    reliability,
    ridership,
    service,
    serviceAndRidership,
    slowzones,
    speed,
    traveltimes,
    tripexplorer,
    weather,
  },
};
