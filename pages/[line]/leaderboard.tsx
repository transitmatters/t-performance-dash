import { BUS_PATH } from '../../common/types/lines';
import { BusSpeedLeaderboardDetails } from '../../modules/speed/BusSpeedLeaderboardDetails';

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
