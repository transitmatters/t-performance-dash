import { EmbedButton } from '../../common/components/buttons/EmbedButton';
import { useDelimitatedRoute } from '../../common/utils/router';
import type { TripEmbed } from './embed';
import { getTripEmbedSnippet } from './embed';

/** Copies an `<iframe>` of this trip chart, for the stops and dates on screen. */
export const TripEmbedButton = (embed: TripEmbed) => {
  const route = useDelimitatedRoute();
  return <EmbedButton getSnippet={() => getTripEmbedSnippet(embed, route)} />;
};
