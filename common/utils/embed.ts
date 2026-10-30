const EMBED_HEIGHT = 360;

/** The `<iframe>` an Embed button copies, for an `/embed/...` path and query. */
export const getEmbedSnippet = (path: string, title: string) => {
  const src = `${window.location.origin}${path}`;
  return `<iframe src="${src}" title="${title} — TransitMatters" width="100%" height="${EMBED_HEIGHT}" style="border:0" loading="lazy"></iframe>`;
};
