// Loaded from the page rather than beside the map component. The map is pulled in with
// `next/dynamic` + ssr: false, and the pages router does not attach such a component's CSS
// to the page -- the stylesheet gets built but nothing links it, and without
// `.maplibregl-canvas { position: absolute }` the canvas never covers its container, so the
// map renders as a blank grey box. Importing it here keeps it scoped to this page.
import 'maplibre-gl/dist/maplibre-gl.css';
import { BUS_PATH } from '../../common/types/lines';
import { BusSpeedMapDetails } from '../../modules/busspeedmap/BusSpeedMapDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    // Bus only: the segment dataset comes from the LAMP bus feed and has no rail equivalent.
    paths: [BUS_PATH],
    fallback: false,
  };
}

export default BusSpeedMapDetails;
