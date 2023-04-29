import { ALL_LINE_PATHS } from '../../common/types/lines';
import SpeedDetails from '../../modules/speed/SpeedDetails';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: ALL_LINE_PATHS,
    fallback: false,
  };
}

export default SpeedDetails;
