const errorMsg = 'No data available. Try another stop or date.';
const txtColor = 'gray';

function font(size_px = 16) {
  return `bold ${size_px}px "Helvetica Neue", "Helvetica", "Arial", sans-serif`;
}

export const writeError = (chart) => {
  const { ctx } = chart;
  ctx.save();

  const { width } = chart;
  const { height } = chart;
  const centerX = width / 2;
  const centerY = height / 2;

  /* shrink font on smaller screens */
  const fontSize = 16;
  ctx.font = font(fontSize);

  ctx.fillStyle = txtColor;
  ctx.textAlign = 'center';
  ctx.fillText(errorMsg, centerX, centerY);

  ctx.restore();
};
