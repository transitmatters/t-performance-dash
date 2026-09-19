// Loaded from the page rather than beside the map component, same as speedmap.tsx -- the
// segment view's "view on map" dialog on this page renders that same dynamically-imported,
// ssr:false map view, and the pages router doesn't attach such a component's CSS to the page
// on its own. Without `.maplibregl-canvas { position: absolute }` the map inside the dialog
// would render as a blank grey box.
import 'maplibre-gl/dist/maplibre-gl.css';
import { BUS_PATH } from '../../common/types/lines';
import { BusSpeedLeaderboardDetails } from '../../modules/busspeedmap/leaderboard/BusSpeedLeaderboardDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    // Bus only: the leaderboard ranks bus routes and has no rail equivalent.
    paths: [BUS_PATH],
    fallback: false,
  };
}

export default BusSpeedLeaderboardDetails;
