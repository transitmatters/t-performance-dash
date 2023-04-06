import { ALL_LINE_PATHS, BUS_PATH } from '../../common/types/lines';
import { HeadwaysLineWide } from '../../modules/lineHeadways/headwaysLineWide';

export async function getStaticProps() {
  return { props: {} };
}

export async function getStaticPaths() {
  return {
    paths: [...ALL_LINE_PATHS, BUS_PATH],
    fallback: false,
  };
}

export default HeadwaysLineWide;
