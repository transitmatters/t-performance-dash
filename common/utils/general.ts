export const hexWithAlpha = (hexColor: string, alpha: number) => {
  const opacity = Math.round(Math.min(Math.max(alpha || 1, 0), 1) * 255);
  return hexColor + opacity.toString(16).toUpperCase();
};
