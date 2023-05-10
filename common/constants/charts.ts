export const watermarkLayout = (isMobile: boolean) => {
  return {
    image: new URL('/Logo_wordmark.png', window.location.origin).toString(),
    x: 10,
    y: 10,
    opacity: 0.2,
    width: isMobile ? 120 : 160,
    height: isMobile ? 11.25 : 15,
    alignToChartArea: true,
    alignX: 'right',
    alignY: 'top',
    position: 'back',
  };
};
